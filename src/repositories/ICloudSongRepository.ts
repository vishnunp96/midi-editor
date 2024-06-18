import { User } from "./IUserRepository"

export interface CloudSong {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  songDataId: string
  userId: string
  publishedAt?: Date
  isPublic?: boolean
  user?: User
  playCount?: number
}

export interface ICloudSongRepository {
  create(data: {
    name: string;
    songDataId: string;
    clientSecret: string
  }): Promise<string>
}
