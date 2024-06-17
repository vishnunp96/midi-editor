import styled from "@emotion/styled"
import { ChangeEvent, FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../main/hooks/useStores"


const ButtonArea = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 60%;
`

const PlusImg = styled.img`
    height: 100%;
    padding: 5px;
`
const InputElement = styled.input`
    opacity: 0;
    cursor: pointer;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
`

export const UploadButton: FC = observer(() => {
  const rootStore = useStores()

  const handleButtonInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target instanceof HTMLInputElement){
      const files = (e.target as HTMLInputElement).files
      if (files)
        rootStore.loadExternalMidi(files).then(r => console.log("File handled"))
      else
        console.log("Files empty")
    }
  }, [rootStore])


  return (
    <ButtonArea className="upload-option" >
      <InputElement type="file" accept="audio/midi" className="upload-input" onChange={handleButtonInput} />
        <PlusImg src={"landing-plus.svg"} alt="Upload MIDI"/>
        <div>
          <h2>Upload MIDI</h2>
        </div>
    </ButtonArea>
  )
})


export default UploadButton;