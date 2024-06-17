import { makeObservable, observable } from "mobx"

export type RoutePath = "/landing" | "/payment"

export default class PageRouter {
  path: RoutePath = "/landing"

  constructor() {
    makeObservable(this, {
      path: observable,
    })
  }

  goToPayment() {
    this.path = "/payment"
  }

  goToLanding() {
    this.path = "/landing"
  }
}
