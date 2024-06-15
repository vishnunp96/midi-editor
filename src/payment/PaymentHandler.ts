// import {
//   Bytes,
//   Firestore,
//   FirestoreDataConverter,
//   Timestamp,
//   collection,
//   doc,
//   getDoc,
// } from "firebase/firestore"
import { Functions, httpsCallable } from "firebase/functions"
// import { ICloudMidiRepository } from "../repositories/ICloudMidiRepository"

export class PaymentHandler {
  constructor(
    // private readonly firestore: Firestore,
    private readonly functions: Functions,
  ) {}

  async getStripeCheckout(priceId: string): Promise<string> {
    const createStripeCheckout = httpsCallable<
      { priceId: string },
      CheckoutResponse
    >(this.functions, "createStripeCheckoutv2")
    const res = await createStripeCheckout({ priceId })
    return res.data.id
  }
}

// interface FirestoreMidi {
//   url: string
//   hash: string
//   name: string
//   data: Bytes
//   createdAt: Timestamp
//   updatedAt: Timestamp
//   paymentReceived: boolean
// }
//
// const midiConverter: FirestoreDataConverter<FirestoreMidi> = {
//   fromFirestore(snapshot, options) {
//     const data = snapshot.data(options)
//     return data as FirestoreMidi
//   },
//   toFirestore(midi) {
//     return midi
//   },
// }


interface CheckoutResponse {
  id: string
}