import { makeObservable, observable } from "mobx"

export type RoutePath = "/landing" | "/payment"

export default class PageRouter {
  path: RoutePath = "/payment"

  constructor() {
    makeObservable(this, {
      path: observable,
    })
  }

  pushPayment() {
    this.path = "/payment"
  }
}
