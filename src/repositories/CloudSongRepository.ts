import { Auth } from "firebase/auth"
import {
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  doc,
  serverTimestamp,
} from "firebase/firestore"
import { songDataCollection } from "./CloudSongDataRepository"
import { CloudSong, ICloudSongRepository } from "./ICloudSongRepository"
import { FirestoreUser, convertUser } from "./UserRepository"
import {
  paymentIntentCollection,
  PaymentIntentRepository
} from "./PaymentIntentRepository"

export class CloudSongRepository implements ICloudSongRepository {
  constructor(
    private readonly firestore: Firestore,
    private readonly auth: Auth,
    private readonly paymentIntentRepository: PaymentIntentRepository
  ) {}

  private get songCollection() {
    return songCollection(this.firestore)
  }

  async create(data: {
    name: string;
    songDataId: string;
    clientSecret: string
  }): Promise<string> {
    if (this.auth.currentUser === null) {
      throw new Error("You must be logged in to save songs to the cloud")
    }

    const paymentId = await this.paymentIntentRepository.getIdFromCs(data.clientSecret)

    const dataRef = doc(songDataCollection(this.firestore), data.songDataId)
    const paymentRef = doc(paymentIntentCollection(this.firestore), paymentId)

    const document = await addDoc(this.songCollection, {
      name: data.name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      dataRef,
      paymentRef,
      userId: this.auth.currentUser.uid,
    })

    return document.id
  }
}

interface FirestoreSong {
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
  dataRef: DocumentReference
  paymentRef: DocumentReference
  userId: string
  playCount?: number
  user?: FirestoreUser
}

const toSong = (doc: QueryDocumentSnapshot<FirestoreSong>): CloudSong => {
  const data = doc.data()
  return {
    ...data,
    id: doc.id,
    songDataId: data.dataRef.id,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    publishedAt: data.publishedAt?.toDate(),
    user: data.user && convertUser(data.userId, data.user),
  }
}

const songConverter: FirestoreDataConverter<FirestoreSong> = {
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as FirestoreSong
    return data
  },
  toFirestore(song) {
    return song
  },
}

export const songCollection = (firestore: Firestore) =>
  collection(firestore, "songs").withConverter(songConverter)
