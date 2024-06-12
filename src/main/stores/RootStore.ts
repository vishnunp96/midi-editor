import { makeObservable, observable } from "mobx"
import { deserialize, serialize } from "serializr"
import Player from "../../common/player"
import Song, { emptySong } from "../../common/song"
import TrackMute from "../../common/trackMute"
import { auth, firestore, functions } from "../../firebase/firebase"
import { CloudMidiRepository } from "../../repositories/CloudMidiRepository"
import {
  CloudSongDataRepository
} from "../../repositories/CloudSongDataRepository"
import { CloudSongRepository } from "../../repositories/CloudSongRepository"
import { ICloudMidiRepository } from "../../repositories/ICloudMidiRepository"
import {
  ICloudSongDataRepository
} from "../../repositories/ICloudSongDataRepository"
import { ICloudSongRepository } from "../../repositories/ICloudSongRepository"
import { IUserRepository } from "../../repositories/IUserRepository"
import { UserRepository } from "../../repositories/UserRepository"
import { setSong } from "../actions"
import {
  loadSongFromExternalMidiFile,
  loadSongFromMidiId
} from "../actions/cloudSong"
import { pushHistory } from "../actions/history"
import { GroupOutput } from "../services/GroupOutput"
import { MIDIInput, previewMidiInput } from "../services/MIDIInput"
import { MIDIRecorder } from "../services/MIDIRecorder"
import { SoundFontSynth } from "../services/SoundFontSynth"
import ArrangeViewStore, {
  SerializedArrangeViewStore
} from "./ArrangeViewStore"
import { AuthStore } from "./AuthStore"
import { CloudFileStore } from "./CloudFileStore"
import { ControlStore, SerializedControlStore } from "./ControlStore"
import { ExportStore } from "./ExportStore"
import HistoryStore from "./HistoryStore"
import { MIDIDeviceStore } from "./MIDIDeviceStore"
import PianoRollStore, { SerializedPianoRollStore } from "./PianoRollStore"
import RootViewStore from "./RootViewStore"
import Router from "./Router"
import SettingStore from "./SettingStore"
import { SoundFontStore } from "./SoundFontStore"
import TempoEditorStore from "./TempoEditorStore"
import { registerReactions } from "./reactions"
import HomeRouter from "./HomeRouter"
import { Bytes } from "firebase/firestore"

// we use any for now. related: https://github.com/Microsoft/TypeScript/issues/1897
type Json = any

export interface SerializedRootStore {
  song: Json
  pianoRollStore: SerializedPianoRollStore
  controlStore: SerializedControlStore
  arrangeViewStore: SerializedArrangeViewStore
}

export type InitializationPhase =
  | "initializing"
  | "loadExternalMidi"
  | "error"
  | "done"

export default class RootStore {
  song: Song = emptySong()
  midiData: Uint8Array = new Uint8Array()
  initializationPhase: InitializationPhase = "initializing"

  readonly cloudSongRepository: ICloudSongRepository = new CloudSongRepository(
    firestore,
    auth,
  )
  readonly cloudSongDataRepository: ICloudSongDataRepository =
    new CloudSongDataRepository(firestore)
  readonly cloudMidiRepository: ICloudMidiRepository = new CloudMidiRepository(
    firestore,
    functions,
  )
  readonly userRepository: IUserRepository = new UserRepository(firestore, auth)

  readonly router = new Router()
  readonly homeRouter = new HomeRouter()
  readonly trackMute = new TrackMute()
  readonly historyStore = new HistoryStore<SerializedRootStore>()
  readonly rootViewStore = new RootViewStore()
  readonly pianoRollStore: PianoRollStore
  readonly controlStore: ControlStore
  readonly arrangeViewStore = new ArrangeViewStore(this)
  readonly tempoEditorStore = new TempoEditorStore(this)
  readonly midiDeviceStore = new MIDIDeviceStore()
  readonly exportStore = new ExportStore()
  readonly authStore = new AuthStore(this.userRepository)
  readonly cloudFileStore = new CloudFileStore(
    this,
    this.cloudSongRepository,
    this.cloudSongDataRepository,
  )
  readonly settingStore = new SettingStore()
  readonly player: Player
  readonly synth: SoundFontSynth
  readonly metronomeSynth: SoundFontSynth
  readonly synthGroup = new GroupOutput()
  readonly midiInput = new MIDIInput()
  readonly midiRecorder: MIDIRecorder
  readonly soundFontStore: SoundFontStore

  constructor() {
    makeObservable(this, {
      song: observable.ref,
      initializationPhase: observable,
    })

    const context = new (window.AudioContext || window.webkitAudioContext)()
    this.synth = new SoundFontSynth(context)
    this.metronomeSynth = new SoundFontSynth(context)
    this.synthGroup.outputs.push({ synth: this.synth, isEnabled: true })

    this.player = new Player(
      this.synthGroup,
      this.metronomeSynth,
      this.trackMute,
      this,
    )
    this.midiRecorder = new MIDIRecorder(this.player, this)

    this.pianoRollStore = new PianoRollStore(this)
    this.controlStore = new ControlStore(this.pianoRollStore)
    this.soundFontStore = new SoundFontStore(this.synth)

    const preview = previewMidiInput(this)

    this.midiInput.onMidiMessage = (e) => {
      preview(e)
      this.midiRecorder.onMessage(e)
    }

    this.pianoRollStore.setUpAutorun()
    this.arrangeViewStore.setUpAutorun()
    this.tempoEditorStore.setUpAutorun()

    registerReactions(this)

    this.init()
  }

  serialize(): SerializedRootStore {
    return {
      song: serialize(this.song),
      pianoRollStore: this.pianoRollStore.serialize(),
      controlStore: this.controlStore.serialize(),
      arrangeViewStore: this.arrangeViewStore.serialize(),
    }
  }

  restore(serializedState: SerializedRootStore) {
    const song = deserialize(Song, serializedState.song)
    this.song = song
    this.pianoRollStore.restore(serializedState.pianoRollStore)
    this.controlStore.restore(serializedState.controlStore)
    this.arrangeViewStore.restore(serializedState.arrangeViewStore)
  }

  private async init() {
    try {
      this.initializationPhase = "initializing"
      await this.synth.setup()
      await this.soundFontStore.init()
      this.setupMetronomeSynth()
      await this.loadExternalMidiOnLaunchIfNeeded()
      this.initializationPhase = "done"
    } catch (e) {
      this.initializationPhase = "error"
      this.rootViewStore.initializeError = e as Error
      this.rootViewStore.openInitializeErrorDialog = true
    }
  }

  private async loadExternalMidiOnLaunchIfNeeded() {
    const params = new URLSearchParams(window.location.search)
    const openParam = params.get("open")
    const idParam = params.get("id");

    if (openParam) {
      this.initializationPhase = "loadExternalMidi"
      console.log("loading midi file from URL: "+openParam)
      const song = await loadSongFromExternalMidiFile(this)(openParam)
      setSong(this)(song)
    } else if(idParam) {
      this.initializationPhase = "loadExternalMidi"
      console.log("loading midi file from ID: "+idParam)
      const song = await loadSongFromMidiId(this)(idParam)
      setSong(this)(song)
    }
  }



  async loadExternalMidi(files: FileList) {
    try {
      this.initializationPhase = "loadExternalMidi"
      console.log("Handling files..")
      const id = await this.handleFiles(files)
      if(id === "error")
        throw new Error("Error handling files")

      console.log("loading midi file from ID: "+id)
      const song = await loadSongFromMidiId(this)(id)
      setSong(this)(song)
      this.homeRouter.path = "/edit";
      this.initializationPhase = "done"
    } catch (e) {
      this.initializationPhase = "error"
      this.rootViewStore.initializeError = e as Error
      this.rootViewStore.openInitializeErrorDialog = true
    }
  }

  private async setupMetronomeSynth() {
    const soundFontURL =
      "https://cdn.jsdelivr.net/gh/ryohey/signal@6959f35/public/A320U_drums.sf2"
    await this.metronomeSynth.setup()
    const data = await (await fetch(soundFontURL)).arrayBuffer()
    await this.metronomeSynth.loadSoundFont(data)
  }

  get pushHistory() {
    return pushHistory(this)
  }

  private async handleFiles(files: FileList | null): Promise<string> {
    if (files == null || files.length !== 1 || files[0].type !== "audio/midi") {
      console.log("File list of unsupported type.");
      alert("Only .mid files supported, one at a time!")
      return "error";
    }
    console.log("File accepted:" + files[0].name);
    const midiBuffer = await files[0].arrayBuffer();
    const midiData = Bytes.fromUint8Array(new Uint8Array(midiBuffer)).toBase64();

    console.log("File length:" + midiBuffer.byteLength);
    console.log("File content:" + midiData);
    return await this.cloudMidiRepository.uploadMidiData(midiData, files[0].name);
  }
}
