import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {finalize, lastValueFrom, map, Observable, Subject, Subscription} from "rxjs";
import {SFSchemaEnumType} from "@delon/form";
import { ComicDownloadMission } from "../../model/ComicDownloadMission";
import { NzMessageService } from "ng-zorro-antd/message";

import { ComicService} from "./comic.service";
import { CrawlService } from "../crawl/crawl.service";

@Injectable({ providedIn: 'root' })
export class ComicDownloadService {

  constructor(
    private http: _HttpClient,
    private comicService: ComicService,
    private crawlService: CrawlService,
    private msgSrv: NzMessageService
  ) { }

  downloadMissionMap: Map<number, ComicDownloadMission> = new Map();

  downloadFinishSubject: Subject<any> = new Subject<any>();

  createDownloadTask(taskInfo: any, comicInfo: any) {
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
    let subscription: Subscription = this.http.post(url, entity).pipe(finalize(() => {  // 已经被取消的订阅再次取消不会触发finalize
      this.downloadFinishSubject.next({
        id: taskInfo.id,
        state: 'final',
        update: false
      });
    })).subscribe({
      next: async (res: any) => {
        // this.msgSrv.success('Comic下载成功');
        try {
          await this.comicService.update({
            id: taskInfo.id,
            localComicPicSrcList: res?.localComicPicSrcList,
            comicFailOrderList: res?.comicFailOrderList,
            onStorage: true
          });

          this.downloadFinishSubject.next({
            id: taskInfo.id,
            state: 'success',
            update: true
          });
          this.msgSrv.success(`${comicInfo.title} Comic下载成功`);
        } catch (e) {
          this.msgSrv.error(`${comicInfo.title} Comic数据更新失败`);
        }
      },
      error:async () => {
        this.msgSrv.error(`${comicInfo.title} Comic下载失败`);
        this.downloadFinishSubject.next({
          id: taskInfo.id,
          state: 'fail',
          update: false
        });
        // try {
        //   await this.comicService.update({
        //     id: taskInfo.id,
        //     onStorage: false
        //   });
        //   this.msgSrv.info('Comic入库状态更新');
        // } catch (e) {
        //   this.msgSrv.error('Comic数据更新失败');
        // }
      },
      complete: () => {}
    })
    this.downloadMissionMap.set(taskInfo.id, {
      id: taskInfo.id,
      subscription: subscription,
      pageList: taskInfo.pageList,
      comicInfo: comicInfo
    });

    return subscription;
  }

  async checkLocalExhentaiComicPages(item: any, pageList: number[]) {
    try {
      let entity = {
        comicPhysicalPath: item.comicPhysicalPath,
        comicServerPath: item.comicServerPath,
        comicPhysicalDirectoryName: item.comicPhysicalDirectoryName,
        comicServerDirectoryName: item.comicServerDirectoryName,
        comicFailOrderList: item.comicFailOrderList,
        localComicPicSrcList: item.localComicPicSrcList,
        pageList
      }
      let res = (await this.crawlService.checkLocalExhentaiComic(entity)) || {}
      let integrity = false;
      if (Array.isArray(res.comicFailOrderList) && res.comicFailOrderList.filter((i: any) => i != '-').length == 0) {
        integrity = true;
      }
      await this.comicService.update({
        id: item.id,
        comicFailOrderList: res?.comicFailOrderList,
        integrity
      });
      this.msgSrv.success(`${item.title} Comic完整性验证成功`);
      return true;
    } catch (e) {
      this.msgSrv.error(`${item.title} Comic完整性验证失败`)
      console.error(e)
      return false;
    }
  }

}
