import { Functions, httpsCallable } from "firebase/functions"

interface PaymentIntentResponse {
  clientSecret: string
  paymentAmount: number
  paymentCurrency: string
}

export class PaymentHandler {
  constructor(
    private readonly functions: Functions,
  ) {}

  async getPaymentIntent(priceId: string, userId: string): Promise<PaymentIntentResponse> {
    if ( priceId === "" || userId === "" ) {
      throw new Error("Invalid priceId or userId")
    }
    const createPaymentIntent = httpsCallable<
      { priceId: string,
        userId: string },
      PaymentIntentResponse
    >(this.functions, "createPaymentIntent")
    try{
      const res = await createPaymentIntent({ priceId, userId })
      return {
        clientSecret: res.data.clientSecret,
        paymentAmount: res.data.paymentAmount,
        paymentCurrency: res.data.paymentCurrency,
      };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      return {
        clientSecret: "",
        paymentAmount: 0,
        paymentCurrency: "",
      }
    }
  }
}

