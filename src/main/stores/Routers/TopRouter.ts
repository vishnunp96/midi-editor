import { makeObservable, observable } from "mobx"

export type RoutePath = "/home" | "/edit"

export default class TopRouter {
  //toDo: revert when done
  path: RoutePath = "/edit"

  constructor() {
    makeObservable(this, {
      path: observable,
    })
  }

  pushEdit() {
    this.path = "/edit"
  }
}
