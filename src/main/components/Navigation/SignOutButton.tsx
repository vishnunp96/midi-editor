import { observer } from "mobx-react-lite"
import { FC } from "react"
import { auth } from "../../../firebase/firebase"
import { useStores } from "../../hooks/useStores"


export const SignOutButton: FC = observer(() => {
  const {
    authStore: { authUser: user },
  } = useStores()

  const onClickSignOut = async () => {
    console.log("Current user:" + user?.displayName)
    await auth.signOut()
  }

  if (user === null) {
    return (
      <></>
    )
  }

  return (
    <a onClick={onClickSignOut} href="/">SIGN OUT</a>
  )
})
