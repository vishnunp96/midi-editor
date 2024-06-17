import React, { FC, useState } from "react"
import './landing-hamburg-menu.css';
import './landing-slideMenu.css';
import { useStores } from "../../../main/hooks/useStores"
import styled from "@emotion/styled"
import { auth } from "../../../firebase/firebase"
import { resetRouters } from "../../../main/stores/Routers/RouterFunctions"


const ClickableP = styled.p`
  cursor: pointer;
`

const HamburgMenu: FC = () => {
  const rootStore = useStores()
  const {
    authStore: { authUser: user },
    topRouter
  } = rootStore


  const [isOpen, setIsOpen] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const resetRoute = () => {
    resetRouters(rootStore)
  }

  const onClickSignOut = async () => {
    await auth.signOut()
    resetRoute()
    handleClick()
  }

  const handleClick = () => {
    setIsOpen(!isOpen);
    setMenuOpened(true);
  };

  const MidiPageLink = () => {
    topRouter.goToMidiEditor()
    handleClick()
  }

  return (
    <div className="box-hamburg">
      <div className={`btn-hamburg ${isOpen ? "active" : "not-active"}`}
           onClick={handleClick}>
        <span className="span-hamburg"></span>
        <span className="span-hamburg"></span>
        <span className="span-hamburg"></span>
      </div>
      <div
        className={`sliding-menu ${menuOpened ? (isOpen ? "in" : "out") : "hidden"}`}>
        <ClickableP onClick={MidiPageLink}>Edit MIDI</ClickableP>
        {/*<ClickableP>Item 2</ClickableP>*/}
        {/*<ClickableP>Item 3</ClickableP>*/}
        {/*<ClickableP>Item 4</ClickableP>*/}
        {user !== null && <ClickableP onClick={onClickSignOut}>SIGN OUT</ClickableP>}
      </div>
    </div>
  )

}

export default HamburgMenu;