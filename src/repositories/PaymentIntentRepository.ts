import {
  Firestore,
  FirestoreDataConverter,
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore"

export class PaymentIntentRepository {
  constructor(private readonly firestore: Firestore) {}

  private get paymentIntentCollection() {
    return paymentIntentCollection(this.firestore)
  }

  private intentDataRef(id: string) {
    return doc(this.paymentIntentCollection, id)
  }

  async getClientSecretFromId(id: string): Promise<string> {
    const ref = this.intentDataRef(id)

    const snapshot = await getDoc(ref)
    const clientSecret = snapshot.data()?.clientSecret
    if (clientSecret === undefined) {
      throw new Error("Payment Intent does not exist.")
    }
    return clientSecret
  }

  private async getByClientSecret(clientSecret: string): Promise<{id: string, data: FirestoreIntentData}[]> {
    const querySnapshot = await getDocs(
      query(
        this.paymentIntentCollection,
        where("clientSecret", "==", clientSecret)
      )
    );

    return querySnapshot.docs.map(doc => ({id: doc.id, data: doc.data() as FirestoreIntentData}));
  }

  async checkPaymentSuccess(clientSecret: string): Promise<boolean> {
    if(clientSecret === undefined || clientSecret === '') throw new Error("clientSecret is undefined");

    const queryResult = await this.getByClientSecret(clientSecret)
    if(queryResult.length !== 1) throw new Error("Payment Intent does not exist or is duplicated.")

    return queryResult[0].data.paymentReceived
  }

  async getIdFromCs(cs: string): Promise<string> {
    const queryResult = await this.getByClientSecret(cs)
    if(queryResult.length !== 1) throw new Error("Payment Intent does not exist or is duplicated.")

    return queryResult[0].id
  }

}

interface FirestoreIntentData {
  createdAt: Timestamp
  updatedAt: Timestamp
  paymentReceived: boolean
  clientSecret: string
  priceId: string
  userId: string
}

const intentConverter: FirestoreDataConverter<FirestoreIntentData> = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)
    return data as FirestoreIntentData
  },
  toFirestore(intent) {
    return intent
  },
}

export const paymentIntentCollection = (firestore: Firestore) =>
  collection(firestore, "paymentIntents").withConverter(intentConverter)
