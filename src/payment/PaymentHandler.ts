import { Functions, httpsCallable } from "firebase/functions"
import { useEffect } from "react"

export class PaymentHandler {
  constructor(
    private readonly functions: Functions,
  ) {}

  async getPaymentIntent(priceId: string, userId: string): Promise<string> {
    const createPaymentIntent = httpsCallable<
      { priceId: string,
        userId: string },
      { clientSecret: string }
    >(this.functions, "createPaymentIntent")
    try{
      const res = await createPaymentIntent({ priceId, userId })
      return res.data.clientSecret;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return ""
    }
  }
}

