import { makeObservable, observable } from "mobx"

export type RoutePath = "/home" | "/edit"

export default class HomeRouter {
  path: RoutePath = "/home"

  constructor() {
    makeObservable(this, {
      path: observable,
    })
  }

  pushEdit() {
    this.path = "/edit"
  }
}
