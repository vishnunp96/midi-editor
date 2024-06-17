import { makeObservable, observable } from "mobx"

export type RoutePath = "/home" | "/edit"

export default class TopRouter {
  path: RoutePath = "/home"

  constructor() {
    makeObservable(this, {
      path: observable,
    })
  }

  goToMidiEditor() {
    this.path = "/edit"
  }

  goToLanding() {
    this.path = "/home"
  }
}
