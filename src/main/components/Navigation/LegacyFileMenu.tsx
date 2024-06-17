import { observer } from "mobx-react-lite"
import { ChangeEvent, FC } from "react"
import { useLocalization } from "../../../common/localize/useLocalization"
import { Localized } from "../../../components/Localized"
import { MenuDivider, MenuItem } from "../../../components/Menu"
import { createSong, openSong, saveSong } from "../../actions"
import { useStores } from "../../hooks/useStores"
import { useToast } from "../../hooks/useToast"

const fileInputID = "OpenButtonInputFile"

export const FileInput: FC<
  React.PropsWithChildren<{
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    accept?: string,
    disabled?: boolean
  }>
> = ({ onChange, children, accept, disabled }) => (
  <>
    <input
      accept={accept}
      style={{ display: "none" }}
      id={fileInputID}
      type="file"
      onChange={onChange}
      disabled={disabled}
    />
    <label htmlFor={fileInputID}>{children}</label>
  </>
)

export const LegacyFileMenu: FC<{ close: () => void }> = observer(
  ({ close }) => {
    const rootStore = useStores()
    const toast = useToast()
    const localized = useLocalization()
    const {authStore: { authUser: user }} = rootStore

    const onClickNew = () => {
      const { song } = rootStore
      close()
      if (
        song.isSaved ||
        confirm(localized("confirm-new", "Are you sure you want to continue?"))
      ) {
        createSong(rootStore)()
      }
    }

    const onClickOpen = async (e: ChangeEvent<HTMLInputElement>) => {
      close()
      try {
        await openSong(rootStore)(e.currentTarget)
      } catch (e) {
        toast.error((e as Error).message)
      }
    }

    const onClickSave = () => {
      close()
      saveSong(rootStore)()
    }

    return (
      <>
        <MenuItem onClick={onClickNew}>
          <Localized default="New">new-song</Localized>
        </MenuItem>

        <MenuDivider />

        <FileInput onChange={onClickOpen} accept="audio/midi" disabled={user === null}>
          <MenuItem style={{ color: user===null ? 'grey' : 'inherit'}}>
            <Localized default="Open">open-song</Localized>
          </MenuItem>
        </FileInput>

        <MenuItem onClick={onClickSave}>
          <Localized default="Save">save-song</Localized>
        </MenuItem>
      </>
    )
  },
)
