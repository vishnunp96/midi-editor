
function handleFiles(files: FileList | null): void {


  if (files == null || files.length !== 1 || files[0].type !== "audio/midi"){
    console.log("File list of unsupported type.");
    alert("Only .mid files supported, one at a time!")
    return;
  }
  console.log("File accepted:" + files[0].name);
}

export function dragDropInput(e: DragEvent): void{
  e.preventDefault();
  if (e.dataTransfer){
    handleFiles(e.dataTransfer.files);
    // const files = e.dataTransfer.files;
    // if (files.length !== 1 || files[0].type !== "audio/midi"){
    //   console.log("File list of unsupported type.");
    //   alert("Only .mid files supported, one at a time!")
    //   return;
    // }
    // console.log(files[0].name);
  }
}

export function uploadInput(e: Event): void{
    if (e.target instanceof HTMLInputElement){
      handleFiles((e.target as HTMLInputElement).files);

      // const files = (e.target as HTMLInputElement).files;
      // if (files == null || files.length !== 1 || files[0].type !== "audio/midi"){
      //   console.log("File list of unsupported type.");
      //   alert("Only .mid files supported, one at a time!")
      //   return;
      // }
      // console.log("File accepted:" + files[0].name);
    }
}