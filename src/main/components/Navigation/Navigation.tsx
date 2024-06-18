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
import { resetRouters } from "../../stores/Routers/RouterFunctions"
import { createSong } from "../../actions/cloudSong"
import Song from "../../../common/song"
import { usePrompt } from "../../hooks/usePrompt"
import AccountCircle from "mdi-react/AccountCircleIcon"

import { SignInToUpload } from "./SignInToUpload"

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
  const rootStore = useStores()
  const {
    authStore: { authUser: user },
    topRouter,
    pageRouter,
    song,
    rootViewStore
  } = rootStore
  const prompt = usePrompt()

  const getSongName = async () => {
    if (song.name.length === 0) {
      const text = await prompt.show({
        title: "Save as",
      });
      if (text !== null && text.length > 0) {
        song.name = text;
      }
    }
    console.log("Song name set as: ", song.name);
  };

  const resetRoute = () => {
    resetRouters(rootStore)
  }

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
          onMouseDown={resetRoute}
        >
          <FavIcon style={IconStyle} viewBox="0 0 512 512"/>
          <TabTitle>
            <Localized default="Home">home</Localized>
          </TabTitle>
        </Tab>
      </Tooltip>

      <FileMenuButton />

      <FlexibleSpacer />

      { user !== null ?
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
          onMouseDown={ async () => {
            await getSongName()
            topRouter.goHome()
            pageRouter.goToPayment()
          }
        }
        >
          <TickIcon style={IconStyle} />
          <TabTitle>
            Purchase
          </TabTitle>
        </Tab>
      </Tooltip> :
        <Tooltip
          title={
            <>
              Sign in to purchase track
            </>
          }
          delayDuration={500}
        >
          <Tab
            className="sign-in"
            onMouseDown={ async () => {
              rootViewStore.openSignInDialog = true
            }
            }
          >
            <AccountCircle style={IconStyle} />
            <TabTitle>
              Sign in to purchase track
            </TabTitle>
          </Tab>
        </Tooltip>


      }

    </Container>
  )
})
