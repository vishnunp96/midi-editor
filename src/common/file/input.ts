import { Bytes } from "firebase/firestore"
import { ChangeEvent } from "react"
import RootStore from "../../main/stores/RootStore"

// can be deleted once home page is cleared out.


async function handleFiles(files: FileList | null, rootStore: RootStore): Promise<void> {
  const {cloudMidiRepository, homeRouter} = rootStore;

  if (files == null || files.length !== 1 || files[0].type !== "audio/midi") {
    console.log("File list of unsupported type.");
    alert("Only .mid files supported, one at a time!")
    return;
  }
  console.log("File accepted:" + files[0].name);
  const midiBuffer = await files[0].arrayBuffer();
  const midiData = Bytes.fromUint8Array(new Uint8Array(midiBuffer)).toBase64();

  console.log("File length:" + midiBuffer.byteLength);
  console.log("File content:" + midiData);
  const id = await cloudMidiRepository.uploadMidiData(midiData, files[0].name);

  // await rootStore.loadExternalMidi(id);
  homeRouter.path = "/edit";
}

export function uploadInput(e: ChangeEvent<HTMLInputElement>, rootStore: RootStore): void{
    if (e.target instanceof HTMLInputElement){
      handleFiles((e.target as HTMLInputElement).files, rootStore).then(_ => console.log("File handled"));
    }
}