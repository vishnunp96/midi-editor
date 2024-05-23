import { Bytes } from "firebase/firestore"

export interface ICloudMidiRepository {
  get(id: string): Promise<{data:Uint8Array, fileName:string}>
  // returns document id
  storeMidiFile(url: string): Promise<string>
  uploadMidiData(midiString: string, fileName: string): Promise<string>
}
