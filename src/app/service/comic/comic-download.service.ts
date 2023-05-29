import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {finalize, lastValueFrom, map, Observable, Subject, Subscription} from "rxjs";
import {SFSchemaEnumType} from "@delon/form";
import { ComicDownloadMission } from "../../model/ComicDownloadMission";
import { ComicService} from "./comic.service";
import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({ providedIn: 'root' })
export class ComicDownloadService {

  constructor(
    private http: _HttpClient,
    private comicService: ComicService,
    private msgSrv: NzMessageService
  ) { }

  downloadMissionMap: Map<number, ComicDownloadMission> = new Map();

  downloadFinishSubject: Subject<any> = new Subject<any>();

  createDownloadTask(taskInfo: any) {
    let entity: any = {
      comicPhysicalPath: taskInfo.comicPhysicalPath,
      comicServerPath: taskInfo.comicServerPath,
      comicPhysicalDirectoryName: taskInfo.comicPhysicalDirectoryName,
      comicServerDirectoryName: taskInfo.comicServerDirectoryName,
      comicPicLinkList: taskInfo.comicPicLinkList ? taskInfo.comicPicLinkList : [],
      localComicPicSrcList: taskInfo.localComicPicSrcList ? taskInfo.localComicPicSrcList : [],
      comicFailOrderList: taskInfo.comicFailOrderList ? taskInfo.comicFailOrderList : [],
      downloadPageList: [...taskInfo.pageList]
    }
    let url = `crawl/comic/download_comic/${taskInfo.id}`
    let subscription: Subscription = this.http.post(url, entity).pipe(finalize(() => {
      this.downloadFinishSubject.next({
        id: taskInfo.id,
        update: false
      });
    })).subscribe({
      next: async (res: any) => {
        this.msgSrv.success('Comic下载成功');
        try {
          await this.comicService.update({
            id: taskInfo.id,
            localComicPicSrcList: res?.localComicPicSrcList,
            comicFailOrderList: res?.comicFailOrderList,
            onStorage: true
          });

          this.downloadFinishSubject.next({
            id: taskInfo.id,
            update: true
          });
          this.msgSrv.success('Comic数据更新成功');
        } catch (e) {
          this.msgSrv.error('Comic数据更新失败');
        }
      },
      error:async () => {
        this.msgSrv.error('Comic下载失败');
        try {
          await this.comicService.update({
            id: taskInfo.id,
            onStorage: false
          });
          this.downloadFinishSubject.next({
            id: taskInfo.id,
            update: true
          });
          this.msgSrv.info('Comic入库状态更新');
        } catch (e) {
          this.msgSrv.error('Comic数据更新失败');
        }
      },
      complete: () => {}
    })
    this.downloadMissionMap.set(taskInfo.id, {
      id: taskInfo.id,
      subscription: subscription,
      pageList: taskInfo.pageList,
    });

    return subscription;
  }

}
