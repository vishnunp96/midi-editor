import _ from "lodash"
import EventEmitter from "eventemitter3"

import {
  serialize as serializeMidiEvent,
  MIDIControlEvents,
  MIDIChannelEvents
} from "@signal-app/midifile-ts"

import EventScheduler from "./EventScheduler"
import Song from "common/song"
import TrackMute from "common/trackMute"
import { deassemble as deassembleNote } from "common/helpers/noteAssembler"
import { deassemble as deassembleRPN } from "common/helpers/RPNAssembler"
import { NoteEvent } from "../track"
import { PlayerEvent } from "./PlayerEvent"

function firstByte(eventType: string, channel: number): number {
  return (MIDIChannelEvents[eventType] << 4) + channel
}

function collectAllEvents(song: Song): PlayerEvent[] {
  return _.flatten(
    song.tracks.map(t =>
      _.chain(t.events)
        .map(e => deassembleNote(e))
        .flatten()
        .map(e => deassembleRPN(e, x => ({ ...x, tick: e.tick })))
        .flatten()
        .map(e => ({ ...e, channel: t.channel }))
        .value()
    )
  )
}

// 同じ名前のタスクを描画タイマーごとに一度だけ実行する
class DisplayTask {
  tasks: { [index: string]: () => void } = {}

  constructor() {
    setInterval(() => this.perform(), 50)
  }

  add(name: string, func: () => void) {
    this.tasks[name] = func
  }

  perform() {
    _.values(this.tasks).forEach(t => t())
    this.tasks = {}
  }
}

const displayTask = new DisplayTask()

interface Message {
  message: number[]
  timestamp: number
}

export interface LoopSetting {
  begin: number
  end: number
  enabled: boolean
}

interface PlayerOutput {
  send(msg: number[], timestamp: DOMHighResTimeStamp): void
  sendEvents(msg: Message[]): void
}

export default class Player extends EventEmitter {
  private _currentTempo = 120
  private _currentTick = 0
  private _scheduler: EventScheduler<PlayerEvent> = null
  private _song: Song
  private _output: PlayerOutput
  private _timebase: number
  private _trackMute: TrackMute

  loop: LoopSetting = {
    begin: null,
    end: null,
    enabled: false
  }

  constructor(timebase: number, output: PlayerOutput, trackMute: TrackMute) {
    super()

    this._output = output
    this._timebase = timebase
    this._trackMute = trackMute
  }

  play(song: Song) {
    this._song = song
    const eventsToPlay = collectAllEvents(song)
    this._scheduler = new EventScheduler(
      eventsToPlay,
      this._currentTick,
      this._timebase
    )
    setInterval(() => this._onTimer(), 50)
  }

  set position(tick: number) {
    if (this._scheduler) {
      this._scheduler.seek(tick)
    }
    this._currentTick = tick
    this.emitChangePosition()

    if (this.isPlaying) {
      this.allSoundsOff()
    }
  }

  get position() {
    return this._currentTick
  }

  get isPlaying() {
    return !!this._scheduler
  }

  get timebase() {
    return this._timebase
  }

  get numberOfChannels() {
    return 0xf
  }

  allSoundsOffChannel(ch: number) {
    this._sendMessage(
      [0xb0 + ch, MIDIControlEvents.ALL_SOUNDS_OFF, 0],
      window.performance.now()
    )
  }

  allSoundsOff() {
    for (const ch of _.range(0, this.numberOfChannels)) {
      this.allSoundsOffChannel(ch)
    }
  }

  allSoundsOffExclude(channel: number) {
    for (const ch of _.range(0, this.numberOfChannels)) {
      if (ch !== channel) {
        this.allSoundsOffChannel(ch)
      }
    }
  }

  stop() {
    this._scheduler = null
    this.allSoundsOff()
  }

  reset() {
    const time = window.performance.now()
    for (const ch of _.range(0, this.numberOfChannels)) {
      // reset controllers
      this._sendMessage(
        [
          firstByte("controller", ch),
          MIDIControlEvents.RESET_CONTROLLERS,
          0x7f
        ],
        time
      )
    }
    this.stop()
    this.position = 0
  }

  get currentTempo() {
    return this._currentTempo
  }

  _sendMessage(msg: number[], timestamp: number) {
    this._output.send(msg, timestamp)
  }

  _sendMessages(msg: Message[]) {
    this._output.sendEvents(msg)
  }

  playNote({
    channel,
    noteNumber,
    velocity,
    duration
  }: Pick<NoteEvent, "noteNumber" | "velocity" | "duration"> & {
    channel: number
  }) {
    const timestamp = window.performance.now()
    this._sendMessage(
      [firstByte("noteOn", channel), noteNumber, velocity],
      timestamp
    )
    this._sendMessage(
      [firstByte("noteOff", channel), noteNumber, 0],
      timestamp + this.tickToMillisec(duration)
    )
  }

  tickToMillisec(tick: number) {
    return (tick / (this._timebase / 60) / this._currentTempo) * 1000
  }

  private _shouldPlayChannel(channel: number) {
    const trackId = this._song.trackIdOfChannel(channel)
    return trackId ? this._trackMute.shouldPlayTrack(trackId) : true
  }

  private _onTimer() {
    if (!this.isPlaying) {
      return
    }

    const timestamp = window.performance.now()
    const events = this._scheduler.readNextEvents(this._currentTempo, timestamp)

    // channel イベントを MIDI Output に送信
    const messages = events
      .filter(
        ({ event }) =>
          event.type === "channel" && this._shouldPlayChannel(event.channel)
      )
      .map(({ event, timestamp }) => ({
        message: serializeMidiEvent(event as any, false),
        timestamp
      }))
    this._sendMessages(messages)

    // channel イベント以外を実行
    events.forEach(({ event, timestamp }) => {
      const e = event
      if (e.type !== "channel" && "subtype" in e) {
        switch (e.subtype) {
          case "setTempo":
            this._currentTempo = 60000000 / e.microsecondsPerBeat
            break
          case "endOfTrack":
            break
          default:
            break
        }
      }
    })

    if (this._scheduler.currentTick >= this._song.endOfSong) {
      this.stop()
    }

    if (this._scheduler) {
      this._currentTick = this._scheduler.currentTick

      if (
        this.loop.enabled &&
        this.loop.begin !== null &&
        this._currentTick >= this.loop.end
      ) {
        this.position = this.loop.begin
      }
    }
    this.emitChangePosition()
  }

  emitChangePosition() {
    displayTask.add("changePosition", () => {
      this.emit("change-position", this._currentTick)
    })
  }
}
