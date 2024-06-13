import styled from "@emotion/styled"
import React, { FC, useCallback } from "react"
import { Head } from "../Head/Head"
import { InitializeErrorDialog } from "../InitializeErrorDialog/InitializeErrorDialog"
import { InitializeLoadingDialog } from "../LoadingDialog/InitializeLoadingDialog"
import { OnBeforeUnload } from "../OnBeforeUnload/OnBeforeUnload"
import { PublishDialog } from "../PublishDialog/PublishDialog"
import { SignInDialog } from "../SignInDialog/SignInDialog"
import background from "../../assets/landing-bg-wallpaper.jpg"
import HamburgMenu from "../../../components/LandingComponents/HamburgMenu/HamburgMenu"
import UploadButton
  from "../../../components/LandingComponents/UploadButton/UploadButton"
import SpeakerButton
  from "../../../components/LandingComponents/SpeakerButton/SpeakerButton"
import { useStores } from "../../hooks/useStores"
import {
  ImageBox,
  ImageLink
} from "../../../components/LandingComponents/ImageTemplates"
import { observer } from "mobx-react-lite"
import { RootView } from "../RootView/RootView"
import { Tooltip } from "../../../components/Tooltip"
import { Localized } from "../../../components/Localized"
import TickIcon from "../../images/icons/circled-tick.svg"
import { IconStyle, Tab, TabTitle } from "../Navigation/Navigation"
import { saveFile } from "../../actions/file"
import RootStore from "../../stores/RootStore"
import { saveSong } from "../../actions"


const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
`

const Header = styled.header`
    width: 100%;
    top:0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    max-height: 6rem;
`

const Footer = styled.footer`
    padding: 1rem 0;
    max-height: 8rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`


const Page = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    background: radial-gradient(transparent 0%, black 70%);
    overflow: hidden;
`

const BackGround = styled.div`
    background-image: url(${background});
    background-size: auto;
    background-position: center;
    width: 100%;
    height: 100%;
`

const PageLanding: FC = () => {
  return (
    <h2>Landing Page</h2>
  )
}

const onClickDownload = async (rootStore: RootStore) => {
  close()
  saveSong(rootStore)()
}

const PagePayment: FC = () => {
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

const PageRouter: FC = observer(() => {
  const { pageRouter } = useStores()
  const path = pageRouter.path
  return (
    <>
      {path === "/landing" && <PageLanding />}
      {path === "/payment" && <PagePayment />}
    </>
  )
})


export const LandingView: FC = () => {

  const rootStore = useStores()

  const handleDragDropInput = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer){
      rootStore.loadExternalMidi(e.dataTransfer.files).then(r => console.log("File handled"))
    }
  }, [rootStore])


  return (
  <>
    <BackGround onDragOver={(ev)=> ev.preventDefault()}
                onDragLeave={(ev)=> ev.preventDefault()}
                onDragEnd={(ev)=> ev.preventDefault()}
                onDrop={(ev)=> handleDragDropInput(ev)}
    >
      <Page>
        <Header>
          <ImageLink href="/"><ImageBox src="favicon.svg" /></ImageLink>
          <HamburgMenu />
        </Header>
        <Container>
          <PageRouter />
        </Container>
        <Footer>
          <UploadButton />
          <SpeakerButton />
        </Footer>
      </Page>
    </BackGround>
    <Head />
    <SignInDialog />
    <InitializeErrorDialog />
    <OnBeforeUnload />
    <InitializeLoadingDialog />
    <PublishDialog />
  </>
  )
}
