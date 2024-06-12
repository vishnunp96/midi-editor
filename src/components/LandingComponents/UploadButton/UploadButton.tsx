import styled from "@emotion/styled"
import { uploadInput } from "../../../common/file/input"
import { FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../main/hooks/useStores"
import {
  FileMenuButton
} from "../../../main/components/Navigation/FileMenuButton"
import { Tooltip } from "../../Tooltip"
import { Localized } from "../../Localized"
import { envString } from "../../../common/localize/envString"
import PianoIcon from "../../../main/images/icons/piano.svg"
import ArrangeIcon from "../../../main/images/icons/arrange.svg"
import TempoIcon from "../../../main/images/icons/tempo.svg"
import Settings from "mdi-react/SettingsIcon"
import Help from "mdi-react/HelpCircleIcon"
import Forum from "mdi-react/ForumIcon"
import { UserButton } from "../../../main/components/Navigation/UserButton"
import {
  IconStyle,
  Tab,
  TabTitle
} from "../../../main/components/Navigation/Navigation"
import {
  ICloudMidiRepository
} from "../../../repositories/ICloudMidiRepository"
import HomeRouter from "../../../main/stores/HomeRouter"

const ButtonArea = styled.div`
    position: relative;
    width: 20%;
    left: 40%;
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

// const UploadButton = () => {
//   return (
//     <ButtonArea className="upload-option" >
//       {/*<InputElement type="file" accept="audio/midi" className="upload-input" onChange={uploadInput} />*/}
//       {/*  <PlusImg src={"landing-plus.svg"} alt="Upload MIDI"/>*/}
//       {/*  <div>*/}
//       {/*    <h2>Upload MIDI</h2>*/}
//       {/*  </div>*/}
//     </ButtonArea>
//   )
//
// }

export const UploadButton: FC = observer(() => {
  const rootStore = useStores()


  // const function uploadButtonInput(e: React.DragEvent, cloudMidiRepository: ICloudMidiRepository, homeRouter: HomeRouter): void{
  //   e.preventDefault();
  //   if (e.dataTransfer){
  //     handleFiles(e.dataTransfer.files, cloudMidiRepository, homeRouter).then(_ => console.log("File handled"));
  //   }
  // }
  const handleButtonInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    uploadInput(e, rootStore)
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