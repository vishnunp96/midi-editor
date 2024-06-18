import { Auth } from "firebase/auth"
import {
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { songDataCollection } from "./CloudSongDataRepository"
import { CloudSong, ICloudSongRepository } from "./ICloudSongRepository"
import { User } from "./IUserRepository"
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

  private songRef(id: string) {
    return doc(this.songCollection, id)
  }

  // async get(id: string): Promise<CloudSong | null> {
  //   const doc = await getDoc(this.songRef(id))
  //
  //   if (!doc.exists()) {
  //     return null
  //   }
  //
  //   return toSong(doc)
  // }

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

  // async update(songId: string, data: Pick<CloudSong, "name">): Promise<void> {
  //   const ref = this.songRef(songId)
  //
  //   await updateDoc(ref, {
  //     updatedAt: serverTimestamp(),
  //     name: data.name,
  //   })
  // }

  // async delete(songId: string): Promise<void> {
  //   await deleteDoc(this.songRef(songId))
  // }

  // async publish(songId: string, user: User): Promise<void> {
  //   const ref = this.songRef(songId)
  //
  //   await updateDoc(ref, {
  //     isPublic: true,
  //     publishedAt: serverTimestamp(),
  //     user,
  //   })
  // }

  // async unpublish(songId: string): Promise<void> {
  //   const ref = this.songRef(songId)
  //
  //   await updateDoc(ref, {
  //     isPublic: false,
  //     publishedAt: null,
  //   })
  // }

  // async getMySongs(): Promise<CloudSong[]> {
  //   if (this.auth.currentUser === null) {
  //     throw new Error("You must be logged in to get songs from the cloud")
  //   }
  //
  //   const res = await getDocs(
  //     query(
  //       this.songCollection,
  //       where("userId", "==", this.auth.currentUser.uid),
  //       orderBy("updatedAt", "desc"),
  //     ),
  //   )
  //
  //   return res.docs.map(toSong)
  // }

  // async getPublicSongs(): Promise<CloudSong[]> {
  //   // 'isPublic'がtrueで、'publishedAt'でソートされたクエリ
  //   const publicSongsQuery = query(
  //     this.songCollection,
  //     where("isPublic", "==", true),
  //     orderBy("publishedAt", "desc"),
  //   )
  //
  //   const docs = await getDocs(publicSongsQuery)
  //   return docs.docs.map(toSong)
  // }

  // async getPublicSongsByUser(userId: string): Promise<CloudSong[]> {
  //   const publicSongsQuery = query(
  //     this.songCollection,
  //     where("isPublic", "==", true),
  //     where("userId", "==", userId),
  //     orderBy("publishedAt", "desc"),
  //   )
  //
  //   const docs = await getDocs(publicSongsQuery)
  //   return docs.docs.map(toSong)
  // }

  // async incrementPlayCount(songId: string): Promise<void> {
  //   const ref = this.songRef(songId)
  //
  //   await updateDoc(ref, {
  //     playCount: increment(1),
  //   })
  // }
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
