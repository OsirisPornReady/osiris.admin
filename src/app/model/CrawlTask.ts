import {Subscription} from "rxjs";

export interface VideoCrawlTask {
  id: number
  videoId: number
  type: string
  state: string
  info: any
  crawlApiUrl: string
  payload: any
  data: any
  subscription: Subscription
}

export interface ComicCrawlTask {
  id: number
  comicId: number
  type: string
  state: string
  info: any
  crawlApiUrl: string
  payload: any
  data: any
  subscription: Subscription
}
