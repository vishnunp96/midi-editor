import CloudOutlined from "mdi-react/CloudOutlineIcon"
import KeyboardArrowDown from "mdi-react/KeyboardArrowDownIcon"
import { observer } from "mobx-react-lite"
import { FC, useCallback, useRef } from "react"
import { Localized } from "../../../components/Localized"
import { Menu, MenuDivider, MenuItem } from "../../../components/Menu"
import { hasFSAccess } from "../../actions/file"
import { useStores } from "../../hooks/useStores"
import { LegacyFileMenu } from "./LegacyFileMenu"
import { Tab } from "./Navigation"

export const FileMenuButton: FC = observer(() => {
  const rootStore = useStores()
  const {
    rootViewStore,
    authStore: { authUser: user },
  } = rootStore
  const isOpen = rootViewStore.openDrawer
  const handleClose = () => (rootViewStore.openDrawer = false)

  const ref = useRef<HTMLDivElement>(null)

  return (
    <Menu
      open={isOpen}
      onOpenChange={(open) =>
        (rootViewStore.openDrawer = open)
      }
      trigger={
        <Tab
          ref={ref}
          onClick={useCallback(() => (rootViewStore.openDrawer = true), [])}
          id="tab-file"
        >
          <span style={{ marginLeft: "0.25rem" }}>
            <Localized default="File">file</Localized>
          </span>
          <KeyboardArrowDown style={{ width: "1rem", marginLeft: "0.25rem" }} />
        </Tab>
      }
    >

      {!hasFSAccess && <LegacyFileMenu close={handleClose} />}

      {user === null && (
        <>
          <MenuDivider />
          <MenuItem
            onClick={() => {
              handleClose()
              rootViewStore.openSignInDialog = true
            }}
          >
            <CloudOutlined style={{ marginRight: "0.5em" }} />
            <Localized default="Sign in to upload MIDI">
              please-sign-in
            </Localized>
          </MenuItem>
        </>
      )}

    </Menu>
  )
})
