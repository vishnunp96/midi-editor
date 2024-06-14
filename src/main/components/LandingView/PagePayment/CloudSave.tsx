import { useLocalization } from "../../../../common/localize/useLocalization"
import { createSong } from "../../../actions/cloudSong"
import { usePrompt } from "../../../hooks/usePrompt"
import { useStores } from "../../../hooks/useStores"
import { useToast } from "../../../hooks/useToast"



export const saveOrCreateSong = async () => {
  const rootStore = useStores()
  const { song } = rootStore
  const prompt = usePrompt()
  const localized = useLocalization()
  const toast = useToast()


  if (song.name.length === 0) {
    const text = await prompt.show({
      title: localized("save-as", "Save as"),
    })
    if (text !== null && text.length > 0) {
      song.name = text
    }
  }
  await createSong(rootStore)(song)
  toast.success(localized("song-created", "Song created"))
}
