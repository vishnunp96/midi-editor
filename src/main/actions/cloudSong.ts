import { songFromMidi, songToMidi } from "../../common/midi/midiConversion"
import Song from "../../common/song"
import RootStore from "../stores/RootStore"

export const createSong =
  ({ cloudSongRepository, cloudSongDataRepository }: RootStore) =>
  async (song: Song, clientSecret: string) => {
    const bytes = songToMidi(song)
    const songDataId = await cloudSongDataRepository.create({ data: bytes })
    const songId = await cloudSongRepository.create({
      name: song.name,
      songDataId: songDataId,
      clientSecret: clientSecret
    })

    song.cloudSongDataId = songDataId
    song.cloudSongId = songId
    song.isSaved = true
  }


export const loadSongFromExternalMidiFile =
  ({ cloudMidiRepository }: RootStore) =>
  async (midiFileUrl: string) => {
    console.log("uploading from: "+ midiFileUrl + " to firebase")
    const id = await cloudMidiRepository.storeMidiFile(midiFileUrl)
    const {data, fileName} = await cloudMidiRepository.get(id)
    const song = songFromMidi(data)
    song.name = fileName
    song.isSaved = true
    return song
  }

export const loadSongFromMidiId =
  ({ cloudMidiRepository }: RootStore) =>
    async (midiId: string) => {
      console.log("Retrieving midiId: "+midiId)
      const {data, fileName} = await cloudMidiRepository.get(midiId)
      const song = songFromMidi(data)
      song.name = fileName
      song.isSaved = true
      return song
    }
