import React, { FC, useCallback } from "react"
import { useStores } from "../../../hooks/useStores"
import { observer } from "mobx-react-lite"
import RootStore from "../../../stores/RootStore"
import { saveSong } from "../../../actions"
import { Tooltip } from "../../../../components/Tooltip"
import { Localized } from "../../../../components/Localized"
import { IconStyle, Tab, TabTitle } from "../../Navigation/Navigation"
import TickIcon from "../../../images/icons/circled-tick.svg"
import { saveOrCreateSong } from "./CloudSave"
import { usePrompt } from "../../../hooks/usePrompt"
import { useLocalization } from "../../../../common/localize/useLocalization"
import { useToast } from "../../../hooks/useToast"
import { createSong } from "../../../actions/cloudSong"



//
// const onClickDownload = async (rootStore: RootStore) => {
//   // await saveOrCreateSong()
//   // close()
//   saveSong(rootStore)()
// }

export const PagePayment: FC = () => {
  const rootStore = useStores()
  const { song } = rootStore
  const prompt = usePrompt()
  const localized = useLocalization()
  const toast = useToast()

  const saveOrCreateSong = async () => {
    if (song.name.length === 0) {
      const text = await prompt.show({
        title: localized("save-as", "Save as"),
      })
      if (text !== null && text.length > 0) {
        song.name = text
      }
    }
    console.log("Current song name: ", song.name)
    await createSong(rootStore)(song)
    toast.success(localized("song-created", "Song created"))
  }

  const onClickDownload = async () => {
    await saveOrCreateSong()
    console.log("savecreate done")
    // close()
    saveSong(rootStore)()
  }



  return (
    <div>
      <h2>Payment Page</h2>

      <Tooltip
        title={
          <>
            <Localized default="Proceed with MIDI">proceed-midi</Localized>
          </>
        }
        delayDuration={500}
      >
        <Tab
          className="tick-midi"
          onMouseDown={useCallback(async () => {
            await onClickDownload();
          }, [])}
        >
          <TickIcon style={IconStyle} />
          <TabTitle>
            <Localized default="Proceed">proceed</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>
    </div>
  )
}

