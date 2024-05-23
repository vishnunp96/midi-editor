import { ICloudMidiRepository } from "../../repositories/ICloudMidiRepository"
import { CloudMidiRepository } from "../../repositories/CloudMidiRepository"
import { firestore, functions } from "../../firebase/firebase"
import { Bytes } from "firebase/firestore"

// get a rootStore for normal website too.
const cloudMidiRepository: ICloudMidiRepository = new CloudMidiRepository(
  firestore,
  functions,
)

async function handleFiles(files: FileList | null): Promise<void> {
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

  window.location.replace("/edit?id=" + id);
}

export function dragDropInput(e: DragEvent): void{
  e.preventDefault();
  if (e.dataTransfer){
    handleFiles(e.dataTransfer.files).then(_ => console.log("File handled"));
  }
}

export function uploadInput(e: Event): void{
    if (e.target instanceof HTMLInputElement){
      handleFiles((e.target as HTMLInputElement).files).then(_ => console.log("File handled"));
    }
}