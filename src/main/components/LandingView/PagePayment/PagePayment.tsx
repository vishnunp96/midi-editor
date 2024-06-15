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
import { loadStripe } from "@stripe/stripe-js"

export const PagePayment: FC = () => {
  const rootStore = useStores()
  const { song, paymentHandler } = rootStore
  const prompt = usePrompt()
  const localized = useLocalization()
  const toast = useToast()
  const stripePromise = loadStripe("pk_test_51PRePO2M0t6YOSnidFRanvy4y5YUlW2kFxgycXGlFfqcB8VGEwnCrTXyhjCeG47yMeKUulSXnkbXx5ckJ5EVhUmr00Y5MRFC9D")



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

  const getCheckout = async () => {
    const priceId = "price_1PRf762M0t6YOSni1MtUdSYO"
    const sessionId = await paymentHandler.getStripeCheckout(priceId)
    const stripe = await stripePromise
    if (stripe)
      stripe.redirectToCheckout({ sessionId })
    else
      throw new Error("Stripe encountered an issue.")
  }

  const onClickPurchase = async () => {
    await getCheckout()
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
            await onClickPurchase();
          }, [])}
        >
          <TickIcon style={IconStyle} />
          <TabTitle>
            <Localized default="Purchase">purchase</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>
    </div>
  )
}

