import styled from "@emotion/styled"
import Forum from "mdi-react/ForumIcon"
import Help from "mdi-react/HelpCircleIcon"
import Settings from "mdi-react/SettingsIcon"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useCallback } from "react"
import { envString } from "../../../common/localize/envString"
import { Localized } from "../../../components/Localized"
import { Tooltip } from "../../../components/Tooltip"
import { useStores } from "../../hooks/useStores"
import TickIcon from "../../images/icons/circled-tick.svg"
import FavIcon from "../../images/icons/favicon.svg"
import Logo from "../../images/logo-circle.svg"
import { FileMenuButton } from "./FileMenuButton"

const BannerContainer = styled.div`
  background: ${({ theme }) => theme.themeColor};
  padding: 0 16px;
  height: 3rem;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  a {
    display: flex;
  }
`

const LogoIcon = styled(Logo)`
  width: 1.5rem;
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
  background: ${({ theme }) => theme.darkBackgroundColor};
  height: 3rem;
  flex-shrink: 0;
`

export const Tab = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center; 
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  border-top: solid 0.1rem transparent;
  color: ${({ theme }) => theme.secondaryTextColor};
  cursor: pointer;

  &.active {
    color: ${({ theme }) => theme.textColor};
    background: ${({ theme }) => theme.backgroundColor};
    border-top-color: ${({ theme }) => theme.themeColor};
  }

  &:hover {
    background: ${({ theme }) => theme.highlightColor};
  }

  a {
    color: inherit;
    text-decoration: none;
  }
}
`

export const TabTitle = styled.span`
  margin-left: 0.5rem;

  @media (max-width: 850px) {
    display: none;
  }
`

const FlexibleSpacer = styled.div`
  flex-grow: 1;
`

export const IconStyle: CSSProperties = {
  width: "1.5rem",
  height: "1.5rem",
}

export const Navigation: FC = observer(() => {
  const {
    rootViewStore,
    authStore: { authUser: user },
    midiRouter,
    topRouter,
    pageRouter
  } = useStores()

  return (
    <Container>

      <Tooltip
        title={
          <>
            <Localized default="Go home">home</Localized>
          </>
        }
        delayDuration={500}
      >
        <Tab
          className="home-icon"
          onMouseDown={useCallback(() => {
            topRouter.path = "/home";
            pageRouter.path = "/landing";
          }, [])}
        >
          <FavIcon style={IconStyle} viewBox="0 0 512 512"/>
          <TabTitle>
            <Localized default="Home">home</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

      <FileMenuButton />

      {/*
      <Tooltip
        title={
          <>
            <Localized default="Switch Tab">switch-tab</Localized> [
            {envString.cmdOrCtrl}+1]
          </>
        }
        delayDuration={500}
      >
        <Tab
          className={router.path === "/track" ? "active" : undefined}
          onMouseDown={useCallback(() => (router.path = "/track"), [])}
        >
          <PianoIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>
            <Localized default="Piano Roll">piano-roll</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

      <Tooltip
        title={
          <>
            <Localized default="Switch Tab">switch-tab</Localized> [
            {envString.cmdOrCtrl}+2]
          </>
        }
        delayDuration={500}
      >
        <Tab
          className={router.path === "/arrange" ? "active" : undefined}
          onMouseDown={useCallback(() => (router.path = "/arrange"), [])}
        >
          <ArrangeIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>
            <Localized default="Arrange">arrange</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

      <Tooltip
        title={
          <>
            <Localized default="Switch Tab">switch-tab</Localized> [
            {envString.cmdOrCtrl}+3]
          </>
        }
        delayDuration={500}
      >
        <Tab
          className={router.path === "/tempo" ? "active" : undefined}
          onMouseDown={useCallback(() => (router.path = "/tempo"), [])}
        >
          <TempoIcon style={IconStyle} viewBox="0 0 128 128" />
          <TabTitle>
            <Localized default="Tempo">tempo</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

      */}


      <FlexibleSpacer />

      {/*}
      <Tab
        onClick={useCallback(
          () => (rootViewStore.openSettingDialog = true),
          [],
        )}
      >
        <Settings style={IconStyle} />
        <TabTitle>
          <Localized default="Settings">settings</Localized>
        </TabTitle>
      </Tab>

      <Tab onClick={useCallback(() => (rootViewStore.openHelp = true), [])}>
        <Help style={IconStyle} />
        <TabTitle>
          <Localized default="Help">help</Localized>
        </TabTitle>
      </Tab>

      <Tab>
        <Forum style={IconStyle} />
        <TabTitle>
          <a href="https://discord.gg/XQxzNdDJse" target="_blank">
            Discord
          </a>
        </TabTitle>
      </Tab>

      <UserButton />
      */}

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
          onMouseDown={useCallback(() => {
            topRouter.path = "/home";
            pageRouter.path = "/payment";
          }, [])}
        >
          <TickIcon style={IconStyle} />
          <TabTitle>
            <Localized default="Proceed">proceed</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

    </Container>
  )
})
