import styled from "@emotion/styled"
import React, { FC, useCallback } from "react"
import { Head } from "../Head/Head"
import { InitializeErrorDialog } from "../InitializeErrorDialog/InitializeErrorDialog"
import { InitializeLoadingDialog } from "../LoadingDialog/InitializeLoadingDialog"
import { OnBeforeUnload } from "../OnBeforeUnload/OnBeforeUnload"
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
import { auth } from "../../../firebase/firebase"
import { PageLanding } from "./PageLanding"
import { SignInToUpload } from "../Navigation/SignInToUpload"
import { PagePayment } from "./PagePayment/PagePayment"
import { resetRouters } from "../../stores/Routers/RouterFunctions"


const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    //justify-content: center;
    align-items: center;
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

const FooterElement = styled.div`
    min-width: 5%;
    justify-content: center;
    align-items: center;
    display: flex;
`


const UploadButtonSwitcher: FC = observer(() => {
  const {
    authStore: { authUser: user },
    pageRouter
  } = useStores()

  return (
    <>
      { pageRouter.path !== "/payment" && (user === null ? <SignInToUpload/> : <UploadButton/>)}
    </>
  )
})


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

const HamburgSwitcher: FC = observer(() => {
  const { pageRouter } = useStores()
  return (
    <>
      {pageRouter.path !== "/payment" && <HamburgMenu />}
    </>
  )
})

export const LandingView: FC = () => {

  const rootStore = useStores()
  const { pageRouter, topRouter } = rootStore

  const handleDragDropInput = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (auth.currentUser === null || pageRouter.path == "/payment") {
      console.log("Accepting files only if signed in..");
      return;
    }

    if (e.dataTransfer){
      rootStore.loadExternalMidi(e.dataTransfer.files).then(r => console.log("File handled"))
    }
  }, [rootStore])

  const resetRoute = () => {
    resetRouters(rootStore)
  }

  return (
  <>
    <BackGround onDragOver={(ev)=> ev.preventDefault()}
                onDragLeave={(ev)=> ev.preventDefault()}
                onDragEnd={(ev)=> ev.preventDefault()}
                onDrop={(ev)=> handleDragDropInput(ev)}
    >
      <Page>
        <Header>
          <ImageLink onClick={resetRoute}><ImageBox src="favicon.svg" /></ImageLink>
          <HamburgSwitcher />
        </Header>
        <Container>
          <PageRouter />
        </Container>
        <Footer>
          <FooterElement></FooterElement>
          <FooterElement>
            <UploadButtonSwitcher />
          </FooterElement>
          <FooterElement>
            <SpeakerButton />
          </FooterElement>
        </Footer>
      </Page>
    </BackGround>
    <Head />
    <SignInDialog />
    <InitializeErrorDialog />
    <OnBeforeUnload />
    <InitializeLoadingDialog />
  </>
  )
}
