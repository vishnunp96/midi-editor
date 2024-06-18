import { orderBy } from "lodash"
import { computed, makeObservable, observable } from "mobx"
import { ICloudSongDataRepository } from "../../repositories/ICloudSongDataRepository"
import {
  CloudSong,
  ICloudSongRepository,
} from "../../repositories/ICloudSongRepository"
import RootStore from "./RootStore"

export class CloudFileStore {
  isLoading = false
  selectedColumn: "name" | "date" = "date"
  dateType: "created" | "updated" = "created"
  sortAscending = false
  _files: CloudSong[] = []

  constructor(
    private readonly rootStore: RootStore,
    private readonly cloudSongRepository: ICloudSongRepository,
    private readonly cloudSongDataRepository: ICloudSongDataRepository,
  ) {
    makeObservable(this, {
      isLoading: observable,
      selectedColumn: observable,
      dateType: observable,
      sortAscending: observable,
      _files: observable,
      files: computed,
    })
  }

  get files() {
    return orderBy(
      this._files,
      (data) => {
        switch (this.selectedColumn) {
          case "name":
            return data.name
          case "date":
            switch (this.dateType) {
              case "created":
                return data.createdAt.getTime()
              case "updated":
                return data.updatedAt.getTime()
            }
        }
      },
      this.sortAscending ? "asc" : "desc",
    )
  }
}
