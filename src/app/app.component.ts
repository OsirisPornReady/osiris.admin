import { Component, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { NavigationEnd, NavigationError, RouteConfigLoadStart, Router } from '@angular/router';
import {_HttpClient, TitleService, VERSION as VERSION_ALAIN} from '@delon/theme';
import { environment } from '@env/environment';
import { NzModalService } from 'ng-zorro-antd/modal';
import { VERSION as VERSION_ZORRO } from 'ng-zorro-antd/version';
import {lastValueFrom, Subscription} from 'rxjs';

import { ComicDownloadService } from './service/comic/comic-download.service';
import { CrawlTaskService } from './service/crawl/crawl-task.service';
import { VideoCrawlTask, ComicCrawlTask } from "./model/CrawlTask";

@Component({
  selector: 'app-root',
  template: ` <router-outlet></router-outlet> `
})
export class AppComponent implements OnInit, OnDestroy {

  downloadFinishSubscription: Subscription = new Subscription();
  videoCrawlFinishSubscription: Subscription = new Subscription();
  comicCrawlFinishSubscription: Subscription = new Subscription();

  constructor(
    el: ElementRef,
    renderer: Renderer2,
    private router: Router,
    private titleSrv: TitleService,
    private modalSrv: NzModalService,
    private comicDownloadService: ComicDownloadService,
    private crawlTaskService: CrawlTaskService,
    private http: _HttpClient
  ) {
    renderer.setAttribute(el.nativeElement, 'ng-alain-version', VERSION_ALAIN.full);
    renderer.setAttribute(el.nativeElement, 'ng-zorro-version', VERSION_ZORRO.full);
  }

  ngOnInit(): void {
    let configLoad = false;
    this.router.events.subscribe(ev => {
      if (ev instanceof RouteConfigLoadStart) {
        configLoad = true;
      }
      if (configLoad && ev instanceof NavigationError) {
        this.modalSrv.confirm({
          nzTitle: `提醒`,
          nzContent: environment.production ? `应用可能已发布新版本，请点击刷新才能生效。` : `无法加载路由：${ev.url}`,
          nzCancelDisabled: false,
          nzOkText: '刷新',
          nzCancelText: '忽略',
          nzOnOk: () => location.reload()
        });
      }
      if (ev instanceof NavigationEnd) {
        this.titleSrv.setTitle();
        this.modalSrv.closeAll();
      }
    });

    this.downloadFinishSubscription = this.comicDownloadService.downloadFinishSubject.subscribe(async (res: any) => {
      if (this.comicDownloadService.downloadMissionMap.has(res.id)) {  //不管是什么原因结束,结束了就把暂存的下载标识删掉
        this.comicDownloadService.downloadMissionMap.delete(res.id);
      }
      try {
        await lastValueFrom(this.http.get(`crawl/comic/cancel_download/${res.id}`));  // 似乎只有这样才能成功发送请求,不知道为啥
      } catch (e) {
        console.error(e)
      }
    })

    this.videoCrawlFinishSubscription = this.crawlTaskService.videoCrawlFinishSubject.subscribe(async (res: any) => {
      if (res.state == 'success') {
        let videoCrawlTask = this.crawlTaskService.videoCrawlTaskList.find((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.id == res.id);
        if (videoCrawlTask) {
          videoCrawlTask.data = res.data;
        }
      } else if (res.state == 'fail') {
        let videoCrawlTask = this.crawlTaskService.videoCrawlTaskList.find((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.id == res.id);
        if (videoCrawlTask) {
          videoCrawlTask.data = null;
        }
      } else if (res.state == 'final') {
        let videoCrawlTask = this.crawlTaskService.videoCrawlTaskList.find((videoCrawlTask: VideoCrawlTask) => videoCrawlTask.id == res.id);
        if (videoCrawlTask) {
          videoCrawlTask.state = 'wait';
          if (res.autoTask) {
            this.crawlTaskService.videoWorkFlowStack.pop();
            if (this.crawlTaskService.videoWorkFlowStack.length == 0) {
              this.crawlTaskService.videoWorkFlowStage = 'wait4confirm'
              this.crawlTaskService.onVideoWorkFlow = false;
            }
          }
        }
      }
    })

    this.comicCrawlFinishSubscription = this.crawlTaskService.comicCrawlFinishSubject.subscribe(async (res: any) => {
      if (res.state == 'success') {
        console.log(res)
        let comicCrawlTask = this.crawlTaskService.comicCrawlTaskList.find((comicCrawlTask: ComicCrawlTask) => comicCrawlTask.id == res.id);
        if (comicCrawlTask) {
          comicCrawlTask.data = res.data;
        }
      } else if (res.state == 'fail') {
        let comicCrawlTask = this.crawlTaskService.comicCrawlTaskList.find((comicCrawlTask: ComicCrawlTask) => comicCrawlTask.id == res.id);
        if (comicCrawlTask) {
          comicCrawlTask.data = null;
        }
      } else if (res.state == 'final') {
        let comicCrawlTask = this.crawlTaskService.comicCrawlTaskList.find((comicCrawlTask: ComicCrawlTask) => comicCrawlTask.id == res.id);
        if (comicCrawlTask) {
          comicCrawlTask.state = 'wait';
        }
      }
    })
  }

  ngOnDestroy() {
    this.downloadFinishSubscription.unsubscribe();
    this.videoCrawlFinishSubscription.unsubscribe();
    this.comicCrawlFinishSubscription.unsubscribe();
  }
}
