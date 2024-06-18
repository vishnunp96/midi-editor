import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Helmet } from "react-helmet-async"
import { useStores } from "../../hooks/useStores"

export const Head: FC = observer(() => {
  const { song,
  topRouter } = useStores()

  return (
    <Helmet>
      <title>
        {topRouter.path !== "/edit" ? "TearWorks" : "" }
        {topRouter.path === "/edit" ? song.name.length === 0 ? "New song" : song.name : ""}
        {topRouter.path === "/edit" ? song.isSaved ? "" : " *" : ""}
      </title>
    </Helmet>
  )
})
