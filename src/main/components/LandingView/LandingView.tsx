import styled from "@emotion/styled"
import { FC } from "react"
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
import { dragDropInput } from "../../../common/file/input"


const Container = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
`

const Image = styled.img`
    height: 4rem;    
`

const ImageLink = styled.a`
    padding: 1rem;
    margin: 0 0.5rem 0;
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


export const LandingView: FC = () => (
  <>
    <BackGround onDragOver={(ev)=> ev.preventDefault()}
                onDragLeave={(ev)=> ev.preventDefault()}
                onDragEnd={(ev)=> ev.preventDefault()}
                onDrop={(ev)=> dragDropInput(ev)}>
      <Page>
        <Header>
          <ImageLink href="/"><Image src="favicon.svg" /></ImageLink>
          <HamburgMenu />
        </Header>
        <Container>
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
