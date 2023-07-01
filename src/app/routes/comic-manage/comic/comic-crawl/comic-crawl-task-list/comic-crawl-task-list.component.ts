import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import {ModalHelper, _HttpClient, DrawerHelper} from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import {NzModalService} from 'ng-zorro-antd/modal';
import { Subscription } from 'rxjs';

import { CrawlService } from '../../../../../service/crawl/crawl.service';
import { CrawlTaskService } from '../../../../../service/crawl/crawl-task.service';

import { ComicManageComicCrawlInfoComponent} from '../comic-crawl-info/comic-crawl-info.component';
import { ComicManageComicEditComponent} from '../../comic-edit/comic-edit.component';

import { ComicCrawlTask} from '../../../../../model/CrawlTask';




@Component({
  selector: 'app-comic-manage-comic-crawl-task-list',
  templateUrl: './comic-crawl-task-list.component.html',
})
export class ComicManageComicCrawlTaskListComponent implements OnInit, OnDestroy {
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
    { title: '', index: 'checked', type: 'checkbox' },
    { title: 'ID', index: 'id' },
    { title: '类型', index: 'type' },
    { title: '漫画ID', index: 'comicId' },
    { title: '状态', index: 'state', render: 'state' },
    // { title: '更新时间', type: 'date', index: 'updateTime' },
    {
      title: '操作',
      buttons: [
        {
          text: '爬取',
          iif: (item) => item.state != 'crawling',
          click: (item: any) => {
            this.startComicCrawlTask(item.id);
          }
        },
        {
          text: '停止',
          iif: (item) => item.state == 'crawling',
          click: (item: any) => {
            this.stopComicCrawlTask(item.id);
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

  comicCrawlFinishSubscription: Subscription = new Subscription();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private crawlService: CrawlService,
    private crawlTaskService: CrawlTaskService,
    private drawer: DrawerHelper,
    private nzModal: NzModalService,
  ) { }

  ngOnInit(): void {
    this.getData();
    this.comicCrawlFinishSubscription = this.crawlTaskService.comicCrawlFinishSubject.subscribe(async (res: any) => {
      if (res.state == 'final') {
        this.st.reload(null, {merge: true, toTop: false});
      }
    })
  }

  ngOnDestroy() {
    this.comicCrawlFinishSubscription.unsubscribe();
  }

  getData() {
    this.data = this.crawlTaskService.comicCrawlTaskList;
  }

  addEdit(id: number = 0): void {
    // this.modal.createStatic(VideoManageVideoQualityEditComponent, { record: { id } }).subscribe(res => {
    //   if (res == 'ok') {
    //     this.st.reload();
    //   }
    // });
  }

  bulkDelete(_data: any) {
    try {
      let taskList: string[] = [];
      taskList = _data.filter((item: any) => {
        return (item.hasOwnProperty('checked') && item.checked)
      })
      if (taskList.length > 0) {
        this.nzModal.confirm({
          nzTitle: '确认开始所选任务吗？',
          nzOkText: '开始',
          nzOnOk: async () => {
            taskList.forEach((task: any) => {
              this.delete(task.id)
            })
          },
          nzCancelText: '取消',
          nzOnCancel: () => console.log('Cancel'),
        });
      } else {
        this.msgSrv.error('至少勾选一项');
        return;
      }
    } catch (error) {}
  }

  bulkStartTask(_data: any) {
    try {
      let taskList: string[] = [];
      taskList = _data.filter((item: any) => {
        return (item.hasOwnProperty('checked') && item.checked)
      })
      if (taskList.length > 0) {
        this.nzModal.confirm({
          nzTitle: '确认开始所选任务吗？',
          nzOkText: '开始',
          nzOnOk: async () => {
            taskList.forEach((task: any) => {
              this.startComicCrawlTask(task.id)
            })
          },
          nzCancelText: '取消',
          nzOnCancel: () => console.log('Cancel'),
        });
      } else {
        this.msgSrv.error('至少勾选一项');
        return;
      }
    } catch (error) {}
  }

  startComicCrawlTask(id: number) {
    this.crawlTaskService.startComicCrawlTask(id);
    this.st.reload()
  }

  stopComicCrawlTask(id: number) {
    this.crawlTaskService.stopComicCrawlTask(id);
    this.st.reload()
  }

  delete(id: number) {
    try {
      this.crawlTaskService.deleteComicCrawlTask(id)  // 由于需要停止任务等特殊处理,不在此进行st reload
      this.msgSrv.success('删除成功');
      // this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

  openDrawer(comicId: number, value: any) {
    this.drawer.create('爬取信息', ComicManageComicCrawlInfoComponent, { record: { id: comicId }, asyncCrawl: true, taskData: value }, {
      size: 1600,
      drawerOptions: {nzClosable: false}
    }).subscribe(res => {
      if (res.state == 'ok') {
        this.modal.createStatic(ComicManageComicEditComponent, {
          record: {id: comicId},
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
