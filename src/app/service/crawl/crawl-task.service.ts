import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {finalize, lastValueFrom, map, Observable, Subject} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";
import { VideoCrawlTask } from "../../model/CrawlTask";
import {ComicDownloadMission} from "../../model/ComicDownloadMission";
import {NzMessageService} from "ng-zorro-antd/message";

@Injectable({ providedIn: 'root' })
export class CrawlTaskService {

  videoCrawlTaskList: VideoCrawlTask[] = [];
  videoCrawlFinishSubject: Subject<any> = new Subject<any>();

  currentAvailableId: number = 1;

  constructor(
    private http: _HttpClient,
    private msgSrv: NzMessageService
  ) { }

  addVideoCrawlTask(videoId: number, videoCrawlTask: VideoCrawlTask) {
    if (videoId == 0) {  // 新添加
      videoCrawlTask.id = this.currentAvailableId;
      this.currentAvailableId++;
      this.videoCrawlTaskList.push(videoCrawlTask);
      this.msgSrv.success('新视频,加入任务队列')
    } else {
      let index = this.videoCrawlTaskList.findIndex((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.videoId == videoId);
      if (index == -1) {  // 没找到videoId相同的
        videoCrawlTask.id = this.currentAvailableId;
        this.currentAvailableId++;
        this.videoCrawlTaskList.push(videoCrawlTask);
        this.msgSrv.success('已有视频,加入任务队列')
      } else {
        this.msgSrv.warning(`该任务已在队列中`);
      }
    }
  }

  deleteVideoCrawlTask(id: number) {
    let index = this.videoCrawlTaskList.findIndex((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.id == id);
    if (index == -1) {  // 没找到
      this.msgSrv.warning(`未找到id对应的任务`);
    } else {
      this.videoCrawlTaskList.splice(index, 1);
      if (this.videoCrawlTaskList.length == 0) {
        this.currentAvailableId = 1;
      }
    }
  }

  startVideoCrawlTask(id: number) {
    let videoCrawlTask = this.videoCrawlTaskList.find((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.id ==id);
    if (!videoCrawlTask) {
      this.msgSrv.error(`未找到id对应的任务`);
      return;
    }
    videoCrawlTask.state = 'crawling';
    videoCrawlTask.subscription = this.http.post(videoCrawlTask.crawlApiUrl, videoCrawlTask.payload)
      .pipe(finalize(() => {
        this.videoCrawlFinishSubject.next({
          id,
          state: 'final',
        });
      }))
      .subscribe({
        next: async (res: any) => {
          this.videoCrawlFinishSubject.next({
            id,
            state: 'success',
            data: res
          });
        },
        error:async () => {
          this.videoCrawlFinishSubject.next({
            id,
            state: 'fail',
          });
        },
        complete: () => {}
      });
  }

  stopVideoCrawlTask(id: number) {
    let videoCrawlTask = this.videoCrawlTaskList.find((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.id ==id);
    if (!videoCrawlTask) {
      this.msgSrv.error(`未找到id对应的任务`);
      return;
    }
    videoCrawlTask.state = 'wait';
    videoCrawlTask.subscription.unsubscribe();
  }

  startComicCrawlTask(url: string, entity: any) {
    // let url = `crawl/comic/exhentai`;
    return this.http.post(url, entity);
  }

}
