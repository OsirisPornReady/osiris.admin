import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STColumnBadge, STColumnTag, STComponent, STData, STPage } from '@delon/abc/st';
import { SFSchema, SFUISchema } from '@delon/form';
import { ModalHelper, _HttpClient, DrawerHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VideoQualityService } from '../../../../service/video/video-quality.service';
import { VideoService } from '../../../../service/video/video.service';
import { VideoManageVideoEditComponent } from '../video-edit/video-edit.component';
import { VideoManageVideoCrawlInfoComponent } from '../video-crawl/video-crawl-info/video-crawl-info.component';

@Component({
  selector: 'app-video-manage-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.less']
})
export class VideoManageVideoListComponent implements OnInit {
  url = `/api/video/get_by_page?sort=publishTime desc`;

  page: STPage = {
    showSize: true,
    pageSizes: [10, 20, 30, 40, 50],
    showQuickJumper: true
  };
  searchParam: any = {
    searchField: 1
  }
  searchSchema: SFSchema = {
    properties: {
      searchField: {
        type: 'string',
        title: '',
        enum: [
          { label: '标题', value: 0 },
          { label: '番号', value: 1 },
          { label: '发布日期', value: 2 }
        ],
      },
      keyword: {
        type: 'string',
        title: ''
      },
      serialNumber: {
        type: 'string',
        title: ''
      },
      publishTime: {
        type: 'string',
        title: ''
      }
    }
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
    $searchField: {
      widget: 'select',
      allowClear: false,
      placeholder: '选择搜索字段',
      borderless: true,
    },
    $keyword: {
      visibleIf: {
        searchField: val => val == 0
      },
    },
    $serialNumber: {
      visibleIf: {
        searchField: val => val == 1
      },
    },
    $publishTime: {
      visibleIf: {
        searchField: val => val == 2
      },
    }
  };
  statusBADGE: STColumnBadge = {
    1: { text: '已入库', color: 'success' },
    2: { text: '未上架', color: 'warning' },
    3: { text: '未入库', color: 'processing' },
    4: { text: '无资源', color: 'error' },
    5: { text: '默认', color: 'default' }
  };
  qualityTAG: STColumnTag = {
    '1': { text: '成功', color: 'green' },
    '2': { text: '错误', color: 'red' },
    '3': { text: '进行中', color: 'blue' },
    '4': { text: '默认', color: '' },
    '5': { text: '警告', color: 'orange' },
  };
  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '关注', width: 70, render: 'customVideoOnSubscription', className: 'text-center' },
    { title: '标题', index: 'title', width: 550 },
    {
      title: '番号',
      width: 150,
      format: (item, col, index) => {
        return item.existSerialNumber ? item.serialNumber : '-';
      },
      className: 'text-center'
    },
    { title: '发行时间', type: 'date', dateFormat: 'yyyy-MM-dd', index: 'publishTime' },
    { title: '资源状态', render: 'customVideoStatus', className: 'text-center' },
    { title: '订阅', render: 'customSwitchVideoSubscription', className: 'text-center' },
    { title: '质量', render: 'customVideoQuality', className: 'text-center' },
    { title: '爬虫', render: 'customVideoInfoCrawlButton', className: 'text-center' },
    // { title: '头像', type: 'img', width: '50px', index: 'avatar' },
    {
      title: '操作',
      buttons: [
        // { text: '查看', click: (item: any) => `/form/${item.id}` },
        {
          text: '编辑',
          // type: 'static', // alain中的static就是不能点击蒙版部分关闭的意思,最好指定component,但此处我们要自己控制modal,所以不用了
          click: (item: any) => {
            this.addEdit(item.id);
          }
        },
        {
          text: '删除',
          type: 'del',
          pop: true,
          click: async (item: any) => {
            await this.delete(item.id);
          }
        }
      ],
      className: 'text-center'
    }
  ];

  isAutoCreate: boolean = true;
  autoCreateSerialNumber: string = '';

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private videoService: VideoService,
    private videoQualityService: VideoQualityService,
    private drawer: DrawerHelper
  ) {}

  async ngOnInit() {
    try {
      let res = (await this.videoQualityService.getDict()) || {};
      if (res) {
        this.qualityTAG = res;
      }
    } catch (e) {
      console.error(e);
    }
  }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.videoService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

  rowClassName(record: STData, index: number) {
    if (record['existSerialNumber']) {
      return 'sign-tr';
    } else return '';
  }

  getVideoStatus(item: any): number {
    let publishTime = new Date(item.publishTime);
    let today = new Date();
    let onStorage = item.onStorage;
    if (item.onStorage) {
      return 1;
    } else {
      if (today < publishTime) {
        return 2;
      } else {
        return 3;
      }
    }
  }

  getVideoQuality(item: any): string {
    return item.videoResolution;
  }

  crawlInfo(value: any) {
    if (value.existSerialNumber) {
      if (value.serialNumber) {
        this.drawer.create('爬取信息', VideoManageVideoCrawlInfoComponent, { record: value }, { size: 1000 }).subscribe(res => {
          if (res.state == 'ok') {
            this.modal.createStatic(VideoManageVideoEditComponent, { record: { id: value.id }, CrawlerData: res.data, needAutoFill: true }).subscribe(res => {
              if (res == 'ok') {
                this.st.reload();
              }
            });
          }
        });
      } else {
        this.msgSrv.info('番号为空');
      }
    } else {
      this.msgSrv.info('未配置番号');
    }
  }

  autoCreate() {
    let autoCreateSerialNumber = this.autoCreateSerialNumber.trim(); //涉及输入框的要做trim处理
    if (!autoCreateSerialNumber) {
      this.msgSrv.info('番号为空');
    } else {
      let value = {
        id: 0,
        existSerialNumber: true,
        serialNumber: autoCreateSerialNumber
      }
      this.crawlInfo(value)
    }
  }

  async switchVideoSubscription(item: any) {
    try {
      await this.videoService.switchVideoSubscription(item.id)
      item.onSubscription = !item.onSubscription;
    } catch (e) {}
  }

}
