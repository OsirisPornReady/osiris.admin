import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {lastValueFrom, map, Observable} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";

@Injectable({ providedIn: 'root' })
export class CrawlService {

  constructor(private http: _HttpClient) { }

  // crawlJavBusVideo(serialNumber: string) {
  //   let url = `crawl/video/jav_bus/${serialNumber}`;
  //   return lastValueFrom(this.http.get(url));
  // }

  crawlJavBusVideo(entity: any) {
    let url = `crawl/video/javbus`;
    return lastValueFrom(this.http.post(url, entity));
  }

  crawlBrazzersVideo(entity: any) {
    let url = `crawl/video/brazzers`;
    return lastValueFrom(this.http.post(url, entity));
  }

  crawlTransAngelsVideo(entity: any) {
    let url = `crawl/video/trans_angels`;
    return lastValueFrom(this.http.post(url, entity));
  }

  crawlVideoByUrl(url: string, entity: any) {
    // let url = `crawl/video/trans_angels`;
    return lastValueFrom(this.http.post(url, entity));
  }

  crawlComicByUrl(url: string, entity: any) {
    // let url = `crawl/comic/exhentai`;
    return lastValueFrom(this.http.post(url, entity));
  }

  downloadVideoImage(entity: any) {
    let url = `crawl/video/download_video_image`;
    return lastValueFrom(this.http.post(url, entity));
  }

}
