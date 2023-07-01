import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import {ModalHelper, _HttpClient, DrawerHelper} from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subscription } from 'rxjs';

import { CrawlService } from '../../../../../service/crawl/crawl.service';
import { CrawlTaskService } from '../../../../../service/crawl/crawl-task.service';
import {VideoManageVideoCrawlInfoComponent} from "../video-crawl-info/video-crawl-info.component";
import {VideoManageVideoEditComponent} from "../../video-edit/video-edit.component";
import {VideoCrawlTask} from "../../../../../model/CrawlTask";



@Component({
  selector: 'app-video-manage-video-crawl-task-list',
  templateUrl: './video-crawl-task-list.component.html',
})
export class VideoManageVideoCrawlTaskListComponent implements OnInit, OnDestroy {
  // url = `/api/video_quality/get_by_page`;

  data: any;
  page: STPage = {
    showSize: true,
    pageSizes: [10, 20, 30, 40, 50],
    showQuickJumper: true,
  };
  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号'
      }
    }
  };
  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: 'ID', index: 'id' },
    { title: '类型', index: 'type' },
    { title: '视频ID', index: 'videoId' },
    { title: '状态', index: 'state' },
    // { title: '更新时间', type: 'date', index: 'updateTime' },
    {
      title: '操作',
      buttons: [
        {
          text: '处理',
          iif: (item) => item.data,
          click: (item: any) => {
            this.openDrawer(item.videoId, item.data);
          }
        },
        {
          text: '爬取',
          iif: (item) => item.state != 'crawling',
          click: (item: any) => {
            this.startVideoCrawlTask(item.id);
          }
        },
        {
          text: '停止爬取',
          iif: (item) => item.state == 'crawling',
          click: (item: any) => {
            this.stopVideoCrawlTask(item.id);
          }
        },
        {
          text: '删除',
          type: 'del',
          pop: true,
          click: async (item: any) => {
            this.delete(item.id);
          }
        }
      ]
    }
  ];

  videoCrawlFinishSubscription: Subscription = new Subscription();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private crawlService: CrawlService,
    private crawlTaskService: CrawlTaskService,
    private drawer: DrawerHelper,
  ) { }

  ngOnInit(): void {
    this.getData();
    this.videoCrawlFinishSubscription = this.crawlTaskService.videoCrawlFinishSubject.subscribe(async (res: any) => {
      if (res.state == 'final') {
        this.st.reload(null, {merge: true, toTop: false});
      }
    })
  }

  ngOnDestroy() {
    this.videoCrawlFinishSubscription.unsubscribe();
  }

  getData() {
    this.data = this.crawlTaskService.videoCrawlTaskList;
  }

  addEdit(id: number = 0): void {
    // this.modal.createStatic(VideoManageVideoQualityEditComponent, { record: { id } }).subscribe(res => {
    //   if (res == 'ok') {
    //     this.st.reload();
    //   }
    // });
  }

  startVideoCrawlTask(id: number) {
    this.crawlTaskService.startVideoCrawlTask(id);
    this.st.reload()
  }

  stopVideoCrawlTask(id: number) {
    this.crawlTaskService.stopVideoCrawlTask(id);
    this.st.reload()
  }

  delete(id: number) {
    try {
      this.crawlTaskService.deleteVideoCrawlTask(id)
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

  openDrawer(videoId: number, value: any) {
    this.drawer.static('爬取信息', VideoManageVideoCrawlInfoComponent, { record: { id: videoId }, asyncCrawl: true, taskData: value }, {
      size: 1600,
      drawerOptions: {nzClosable: false}
    }).subscribe(res => {
      if (res.state == 'ok') {
        this.modal.createStatic(VideoManageVideoEditComponent, {
          record: {id: videoId},
          automated: true,
          automatedData: res.data
        }).subscribe(res => {
          if (res == 'ok') {
            // this.st.reload();
          }
        });
      }
    });
  }

}
