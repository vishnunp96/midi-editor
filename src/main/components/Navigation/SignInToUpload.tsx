import AccountCircle from "mdi-react/AccountCircleIcon"
import { observer } from "mobx-react-lite"
import { CSSProperties, FC, useRef } from "react"
import { Localized } from "../../../components/Localized"
import { Menu, MenuItem } from "../../../components/Menu"
import { auth } from "../../../firebase/firebase"
import { useStores } from "../../hooks/useStores"
import { useTheme } from "../../hooks/useTheme"
import { IconStyle, Tab, TabTitle } from "./Navigation"
import styled from "@emotion/styled"

export const SignInToUpload: FC = observer(() => {
  const {
    rootViewStore
  } = useStores()

  const onClickSignIn = () => (rootViewStore.openSignInDialog = true)

  const ButtonArea = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 60%;
`

  return (
    <ButtonArea>
      <Tab onClick={onClickSignIn}>
        <AccountCircle style={IconStyle} />
        <TabTitle>
          <Localized default="Sign in to upload MIDI">sign-in</Localized>
        </TabTitle>
      </Tab>
    </ButtonArea>
  )
})
