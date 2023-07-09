import { Injectable } from '@angular/core';
import {_HttpClient, DrawerHelper, ModalHelper} from '@delon/theme';
import {finalize, lastValueFrom, map, Observable, Subject} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";
import {NzMessageService} from "ng-zorro-antd/message";

import { VideoCrawlTask, ComicCrawlTask } from "../../model/CrawlTask";
import {ComicDownloadMission} from "../../model/ComicDownloadMission";

import {VideoManageVideoCrawlInfoComponent} from "../../routes/video-manage/video/video-crawl/video-crawl-info/video-crawl-info.component";
import {VideoManageVideoEditComponent} from "../../routes/video-manage/video/video-edit/video-edit.component";

@Injectable({ providedIn: 'root' })
export class CrawlTaskService {

  videoCrawlTaskList: VideoCrawlTask[] = [];
  videoCrawlTaskVideoIdMap: Map<number, boolean> = new Map();
  videoWorkFlowStack: any[] = [];
  videoCrawlSuccessCount: number = 0;
  videoWorkFlowStage: string = 'wait4start';
  onVideoWorkFlow: boolean = false;
  videoCrawlFinishSubject: Subject<any> = new Subject<any>();

  comicCrawlTaskList: ComicCrawlTask[] = [];
  comicCrawlFinishSubject: Subject<any> = new Subject<any>();

  currentVideoCrawlTaskAvailableId: number = 1;
  currentComicCrawlTaskAvailableId: number = 1;

  constructor(
    private http: _HttpClient,
    private msgSrv: NzMessageService,
    private drawer: DrawerHelper,
    private modal: ModalHelper
  ) { }


  // Video Crawl Task

  addVideoCrawlTask(videoId: number, videoCrawlTask: VideoCrawlTask) {
    if (videoId == 0) {  // 新添加
      videoCrawlTask.id = this.currentVideoCrawlTaskAvailableId;
      this.currentVideoCrawlTaskAvailableId++;
      this.videoCrawlTaskList.push(videoCrawlTask);
      // this.msgSrv.success('新视频,加入任务队列')
    } else {
      this.videoCrawlTaskVideoIdMap.set(videoId, true);
      let index = this.videoCrawlTaskList.findIndex((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.videoId == videoId);
      if (index == -1) {  // 没找到videoId相同的
        videoCrawlTask.id = this.currentVideoCrawlTaskAvailableId;
        this.currentVideoCrawlTaskAvailableId++;
        this.videoCrawlTaskList.push(videoCrawlTask);
        // this.msgSrv.success('已有视频,加入任务队列')
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
      let videoCrawlTask = this.videoCrawlTaskList[index];
      let videoId = videoCrawlTask.videoId;
      if (this.videoCrawlTaskVideoIdMap.has(videoId)) {
        this.videoCrawlTaskVideoIdMap.delete(videoId);
      }
      this.videoCrawlTaskList.splice(index, 1);
      if (this.videoCrawlTaskList.length == 0) {
        this.currentVideoCrawlTaskAvailableId = 1;
      }
      if (videoCrawlTask.state == 'crawling') {
        videoCrawlTask.subscription.unsubscribe();
      } else {
        this.videoCrawlFinishSubject.next({
          state: 'reload',
        });
      }
    }
  }

  startVideoCrawlTask(id: number, autoTask: boolean = false) {
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
          autoTask
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

  async executeVideoWorkFlow(): Promise<any> {
    if (this.onVideoWorkFlow) {
      this.msgSrv.warning('正在执行工作流');
      return;
    }

    // 爬取数据步骤
    if (this.videoWorkFlowStage == 'wait4start') {
      if (this.videoCrawlTaskList.length == 0) {
        this.msgSrv.info('当前任务列表为空');
        return;
      }
      this.onVideoWorkFlow = true;
      this.videoWorkFlowStage = 'crawling';
      this.videoWorkFlowStack = new Array(this.videoCrawlTaskList.length).fill(true);
      this.videoCrawlTaskList.forEach((task: VideoCrawlTask) => {
        this.startVideoCrawlTask(task.id, true);
      })
    }

    //确认数据步骤
    if (this.videoWorkFlowStage == 'wait4confirm') {
      this.onVideoWorkFlow = true;
      this.videoWorkFlowStage = 'confirming';
      for (let index = 0; index < this.videoCrawlTaskList.length; index++) {
        let task = this.videoCrawlTaskList[index];
        if (task.data) {
          const videoId = task.videoId;
          await new Promise((resolve, reject) => {
            this.drawer.create('爬取信息', VideoManageVideoCrawlInfoComponent, { record: { id: videoId }, asyncCrawl: true, taskData: task.data }, {
              size: 1600,
              drawerOptions: {nzClosable: false}
            }).subscribe({
                next: res => {
                  if (res.state == 'ok') {
                    this.modal.createStatic(VideoManageVideoEditComponent, {
                      record: {id: videoId},
                      automated: true,
                      automatedData: res.data
                    }).subscribe(res => {
                      resolve(true);
                    });
                  } else {
                    resolve(true);
                  }
                },
                error: () => { resolve(true); },
                complete: () => { resolve(true); }
            });
          })
          if (this.videoCrawlTaskVideoIdMap.has(videoId)) {
            this.videoCrawlTaskVideoIdMap.delete(videoId);
          }
          this.videoCrawlSuccessCount--;
          if (index < this.videoCrawlTaskList.length - 1) {
            await new Promise((resolve, reject) => {
              setTimeout(()=>{ resolve(true) }, 2000);
            })
          }
        }
      }
      // this.videoCrawlTaskList.length = 0;
      this.videoCrawlTaskList = this.videoCrawlTaskList.filter((task: VideoCrawlTask) => !task.data);
      this.onVideoWorkFlow = false;
      this.videoWorkFlowStage = 'wait4start';
      return {
        message: 'confirm-finished'
      }
    }

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
      let comicCrawlTask = this.comicCrawlTaskList[index];
      this.comicCrawlTaskList.splice(index, 1);
      if (this.comicCrawlTaskList.length == 0) {
        this.currentComicCrawlTaskAvailableId = 1;
      }
      if (comicCrawlTask.state == 'crawling') {
        comicCrawlTask.subscription.unsubscribe();
      } else {
        this.comicCrawlFinishSubject.next({
          state: 'reload',
        });
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

  executeComicCrawlTaskList() {

  }

}
