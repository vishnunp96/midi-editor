import { useStores } from "../../hooks/useStores"
import RootStore from "../RootStore"


export const resetRouters = (rootStore: RootStore) => {
  const {topRouter, midiRouter, pageRouter } = rootStore
  console.log("Going home..")
  topRouter.goHome()
  pageRouter.goToLanding()
  midiRouter.reset()
}