import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { useStores } from "../../hooks/useStores"
import { ArrangeEditor } from "../ArrangeView/ArrangeEditor"
import { BuildInfo } from "../BuildInfo"
import { CloudFileDialog } from "../CloudFileDialog/CloudFileDialog"
import { ControlSettingDialog } from "../ControlSettingDialog/ControlSettingDialog"
import { ExportDialog } from "../ExportDialog/ExportDialog"
import { ExportProgressDialog } from "../ExportDialog/ExportProgressDialog"
import { Head } from "../Head/Head"
import { HelpDialog } from "../Help/HelpDialog"
import { InitializeErrorDialog } from "../InitializeErrorDialog/InitializeErrorDialog"
import { InitializeLoadingDialog } from "../LoadingDialog/InitializeLoadingDialog"
import { Navigation } from "../Navigation/Navigation"
import { OnBeforeUnload } from "../OnBeforeUnload/OnBeforeUnload"
import { PianoRollEditor } from "../PianoRoll/PianoRollEditor"
import { PublishDialog } from "../PublishDialog/PublishDialog"
import { SettingDialog } from "../SettingDialog/SettingDialog"
import { SignInDialog } from "../SignInDialog/SignInDialog"
import { TempoEditor } from "../TempoGraph/TempoEditor"
import { TransportPanel } from "../TransportPanel/TransportPanel"
import { ArrangeTransposeDialog } from "../TransposeDialog/ArrangeTransposeDialog"
import { PianoRollTransposeDialog } from "../TransposeDialog/PianoRollTransposeDialog"
import background from "../../assets/landing-bg-wallpaper.jpg"
import HamburgMenu from "../../../components/LandingComponents/HamburgMenu/HamburgMenu"
import UploadButton
  from "../../../components/LandingComponents/UploadButton/UploadButton"


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
    <BackGround>
      <Page>
        <Header>
          <ImageLink href="/"><Image src="favicon.svg" /></ImageLink>
          <HamburgMenu />
        </Header>
        <Container>
        </Container>
        <Footer>
          <UploadButton />
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
