import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {lastValueFrom, map, Observable, Subject} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";
import {VideoService} from "./video.service";
import {CrawlService} from "../crawl/crawl.service";
import {NzMessageService} from "ng-zorro-antd/message";

@Injectable({ providedIn: 'root' })
export class VideoImageDownloadService {

  constructor(
    private http: _HttpClient,
    private videoService: VideoService,
    private crawlService: CrawlService,
    private msgSrv: NzMessageService,
  ) { }

  imageDownloadFinishSubject: Subject<any> = new Subject<any>();

  downloadVideoImage(item: any) {  // await
    let entity: any = {
      imagePhysicalPath: item.imagePhysicalPath,
      imageServerPath: item.imageServerPath,
      imagePhysicalDirectoryName: item.imagePhysicalDirectoryName,
      imageServerDirectoryName: item.imageServerDirectoryName,
      coverSrc: item.coverSrc,
      localCoverSrc: item.localCoverSrc,
      previewImageSrcList: item.previewImageSrcList,
      localPreviewImageSrcList: item.localPreviewImageSrcList,
    }
    if (item.id == -1) {
      this.msgSrv.error('video记录更新失败!');
      return null;
    }
    return this.crawlService.downloadVideoImage(entity).subscribe({
      next: async (res: any) => {
        try {
          await this.videoService.update({
            id: item.id,
            localCoverSrc: res?.localCoverSrc,
            localPreviewImageSrcList: res?.localPreviewImageSrcList
          });
          this.imageDownloadFinishSubject.next({ state: 'success' });
        } catch (e) {
          console.error(e)
        }
      },
      error: () => {
        this.msgSrv.error('下载预览图失败!')
      }
    });
  }

}
