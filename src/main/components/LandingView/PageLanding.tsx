import React, { FC, useCallback } from "react"
import { useStores } from "../../hooks/useStores"
import { observer } from "mobx-react-lite"




const NoAuthPage = () => {
  return (
    <>
      <h2>Not Authenticated</h2>
    </>
  )
}

interface AuthPageProps {
  userName: string;
}

const AuthPage: FC<AuthPageProps> = ({ userName }) => {
  return (
    <h2>Authenticated with {userName}</h2>
  );
};


export const PageLanding: FC = observer(() => {
  const {
    authStore: { authUser: user },
  } = useStores()


  return (
    <>
      {user === null ? <NoAuthPage /> : <AuthPage userName={user.displayName ? user.displayName : ""}/>}
    </>
  )
})