import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {finalize, lastValueFrom, map, Observable, Subject} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";
import { VideoCrawlTask, ComicCrawlTask } from "../../model/CrawlTask";
import {ComicDownloadMission} from "../../model/ComicDownloadMission";
import {NzMessageService} from "ng-zorro-antd/message";

@Injectable({ providedIn: 'root' })
export class CrawlTaskService {

  videoCrawlTaskList: VideoCrawlTask[] = [];
  videoCrawlFinishSubject: Subject<any> = new Subject<any>();

  comicCrawlTaskList: ComicCrawlTask[] = [];
  comicCrawlFinishSubject: Subject<any> = new Subject<any>();

  currentVideoCrawlTaskAvailableId: number = 1;
  currentComicCrawlTaskAvailableId: number = 1;

  constructor(
    private http: _HttpClient,
    private msgSrv: NzMessageService
  ) { }


  // Video Crawl Task

  addVideoCrawlTask(videoId: number, videoCrawlTask: VideoCrawlTask) {
    if (videoId == 0) {  // 新添加
      videoCrawlTask.id = this.currentVideoCrawlTaskAvailableId;
      this.currentVideoCrawlTaskAvailableId++;
      this.videoCrawlTaskList.push(videoCrawlTask);
      this.msgSrv.success('新视频,加入任务队列')
    } else {
      let index = this.videoCrawlTaskList.findIndex((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.videoId == videoId);
      if (index == -1) {  // 没找到videoId相同的
        videoCrawlTask.id = this.currentVideoCrawlTaskAvailableId;
        this.currentVideoCrawlTaskAvailableId++;
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
        this.currentVideoCrawlTaskAvailableId = 1;
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


  // Comic Crawl Task

  addComicCrawlTask(comicId: number, comicCrawlTask: ComicCrawlTask) {
    if (comicId == 0) {  // 新添加
      comicCrawlTask.id = this.currentComicCrawlTaskAvailableId;
      this.currentComicCrawlTaskAvailableId++;
      this.comicCrawlTaskList.push(comicCrawlTask);
      this.msgSrv.success('新漫画,加入任务队列')
    } else {
      let index = this.comicCrawlTaskList.findIndex((comicCrawlTask: ComicCrawlTask) => comicCrawlTask.comicId == comicId);
      if (index == -1) {  // 没找到comicId相同的
        comicCrawlTask.id = this.currentComicCrawlTaskAvailableId;
        this.currentComicCrawlTaskAvailableId++;
        this.comicCrawlTaskList.push(comicCrawlTask);
        this.msgSrv.success('已有漫画,加入任务队列')
      } else {
        this.msgSrv.warning(`该任务已在队列中`);
      }
    }
  }

  deleteComicCrawlTask(id: number) {
    let index = this.comicCrawlTaskList.findIndex((comicCrawlTask: ComicCrawlTask) => comicCrawlTask.id == id);
    if (index == -1) {  // 没找到
      this.msgSrv.warning(`未找到id对应的任务`);
    } else {
      this.comicCrawlTaskList.splice(index, 1);
      if (this.comicCrawlTaskList.length == 0) {
        this.currentComicCrawlTaskAvailableId = 1;
      }
    }
  }

  startComicCrawlTask(id: number) {
    let comicCrawlTask = this.comicCrawlTaskList.find((comicCrawlTask: ComicCrawlTask) => comicCrawlTask.id ==id);
    if (!comicCrawlTask) {
      this.msgSrv.error(`未找到id对应的任务`);
      return;
    }
    comicCrawlTask.state = 'crawling';
    comicCrawlTask.subscription = this.http.post(comicCrawlTask.crawlApiUrl, comicCrawlTask.payload)
      .pipe(finalize(() => {
        this.comicCrawlFinishSubject.next({
          id,
          state: 'final',
        });
      }))
      .subscribe({
        next: async (res: any) => {
          this.comicCrawlFinishSubject.next({
            id,
            state: 'success',
            data: res
          });
        },
        error:async () => {
          this.comicCrawlFinishSubject.next({
            id,
            state: 'fail',
          });
        },
        complete: () => {}
      });
  }

  stopComicCrawlTask(id: number) {
    let comicCrawlTask = this.comicCrawlTaskList.find((comicCrawlTask: ComicCrawlTask) => comicCrawlTask.id ==id);
    if (!comicCrawlTask) {
      this.msgSrv.error(`未找到id对应的任务`);
      return;
    }
    comicCrawlTask.state = 'wait';
    comicCrawlTask.subscription.unsubscribe();
  }

}
