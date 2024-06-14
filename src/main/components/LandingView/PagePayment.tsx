import React, { FC, useCallback } from "react"
import { useStores } from "../../hooks/useStores"
import { observer } from "mobx-react-lite"
import RootStore from "../../stores/RootStore"
import { saveSong } from "../../actions"
import { Tooltip } from "../../../components/Tooltip"
import { Localized } from "../../../components/Localized"
import { IconStyle, Tab, TabTitle } from "../Navigation/Navigation"
import TickIcon from "../../images/icons/circled-tick.svg"




const onClickDownload = async (rootStore: RootStore) => {
  close()
  saveSong(rootStore)()
}

export const PagePayment: FC = () => {
  const rootStore = useStores()

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
            await onClickDownload(rootStore);
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

