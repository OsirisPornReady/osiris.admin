import {Subscription} from "rxjs";

export interface ComicDownloadMission {
  id: string
  subscription: Subscription
  pageList: number[]
}
