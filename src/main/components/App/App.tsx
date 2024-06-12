import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import React, { FC } from "react"
import { HelmetProvider } from "react-helmet-async"
import { defaultTheme } from "../../../common/theme/Theme"
import { ActionDialog } from "../../../components/ActionDialog"
import { PromptDialog } from "../../../components/PromptDialog"
import { Toast } from "../../../components/Toast"
import { DialogProvider } from "../../hooks/useDialog"
import { PromptProvider } from "../../hooks/usePrompt"
import { StoreContext, useStores } from "../../hooks/useStores"
import { ThemeContext } from "../../hooks/useTheme"
import { ToastProvider } from "../../hooks/useToast"
import RootStore from "../../stores/RootStore"
import { GlobalKeyboardShortcut } from "../KeyboardShortcut/GlobalKeyboardShortcut"
import { RootView } from "../RootView/RootView"
import { LandingView } from "../LandingView/LandingView"
import { EmotionThemeProvider } from "../Theme/EmotionThemeProvider"
import { GlobalCSS } from "../Theme/GlobalCSS"
import { LocalizationProvider } from "./LocalizationProvider"
import { observer } from "mobx-react-lite"
import { PianoRollEditor } from "../PianoRoll/PianoRollEditor"
import { TempoEditor } from "../TempoGraph/TempoEditor"
import { ArrangeEditor } from "../ArrangeView/ArrangeEditor"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  environment: process.env.VERCEL_ENV,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
})


const rootStore = new RootStore()


const HomeRouter: FC = observer(() => {
  const { homeRouter } = useStores()
  const path = homeRouter.path
  return (
    <>
      {path === "/home" && <LandingView />}
      {path === "/edit" && <RootView />}
    </>
  )
})

export function App() {
  return (
    <React.StrictMode>
      <StoreContext.Provider value={rootStore}>
        <ThemeContext.Provider value={defaultTheme}>
          <EmotionThemeProvider>
            <HelmetProvider>
              <ToastProvider component={Toast}>
                <PromptProvider component={PromptDialog}>
                  <DialogProvider component={ActionDialog}>
                    <LocalizationProvider>
                      <GlobalKeyboardShortcut />
                      <GlobalCSS />
                      <HomeRouter />
                    </LocalizationProvider>
                  </DialogProvider>
                </PromptProvider>
              </ToastProvider>
            </HelmetProvider>
          </EmotionThemeProvider>
        </ThemeContext.Provider>
      </StoreContext.Provider>
    </React.StrictMode>
  )
}
