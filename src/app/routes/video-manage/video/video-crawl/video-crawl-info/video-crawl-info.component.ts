import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { fromEvent } from "rxjs";

import { VideoTagService } from '../../../../../service/video/video-tag.service';
import { VideoService } from '../../../../../service/video/video.service';
import { CommonService } from '../../../../../service/common/common.service';
import { CrawlService } from '../../../../../service/crawl/crawl.service';

import { dateStringFormatter } from "../../../../../shared/utils/dateUtils";

@Component({
  selector: 'app-video-manage-video-crawl-info',
  templateUrl: './video-crawl-info.component.html',
  styleUrls: ['/video-crawl-info.component.less']
})
export class VideoManageVideoCrawlInfoComponent implements OnInit, OnDestroy, AfterViewInit {
  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      serialNumber: { type: 'string', title: '番号' },
      title: { type:'string', title: '标题' },
      videoType: { type: 'string', title: '类型' },
      publishTime: { type:'string', title: '发布时间', format: 'date' },
      duration: { type:'number', title: '时长' },
      director: { type:'string', title: '导演' },
      producer: { type:'string', title: '制作商' },
      releaser: { type:'string', title: '发行商' },
      brand: { type: 'string', title: '厂牌' },
      series: { type:'string', title: '系列' },
      starsRaw: { type: 'string', title: '演员' },
      tagsRaw: { type: 'string', title: '标签' },
      description: { type: 'string', title: '描述' }
    },
    required: ['title'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 145,
      grid: { span: 22 }
    },
    $serialNumber: {
      widget: 'text',
      defaultText: '-',
      html: true
    },
    $duration: {
      unit: '分钟',
      widgetWidth: 150,
      precision: 0
    },
    $director: {
      visibleIf: {
        videoType: val => val == 2 || val == 3
      },
      placeholder: '请选择导演',
    },
    $producer: {
      visibleIf: {
        videoType: val => val == 2
      },
      placeholder: '请选择制作商',
    },
    $releaser: {
      visibleIf: {
        videoType: val => val == 2
      },
      placeholder: '请选择发行商',
    },
    $brand: {
      visibleIf: {
        videoType: val => val == 3
      },
      placeholder: '请选择厂牌',
    },
    $series: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择系列',
      mode: 'tags',
      default: null,
    },
    $starsRaw: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择演员',
      mode: 'tags',
      default: null,
    },
    $tagsRaw: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择标签',
      mode: 'tags',
      default: null,
    },
    $description: {
      widget: 'textarea',
      autosize: { minRows: 3, maxRows: 6 }
    },
  };

  coverSrc: string = ''
  javUrl: string = ''
  btdigUrl: string = ''
  nyaaUrl: string = ''
  previewImageSrcList: string[] = [];
  enterSubscription: any = null;

  constructor(
    private drawer: NzDrawerRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoTagService: VideoTagService,
    private videoService: VideoService,
    private commonService: CommonService,
    private crawlService: CrawlService
  ) {}

  async ngOnInit() {
    let crawlingMsgId = '';
    if (this.record.hasOwnProperty('crawlKey') && this.record.hasOwnProperty('crawlType')) {
      if (!(typeof this.record.crawlKey == 'string' && Number.isFinite(this.record.crawlType))) { //直接在前端进行类型检查吧
        this.msgSrv.error('爬虫参数类型错误,请关闭页面');
        console.log(this.record)
        return;
      }
    } else {
      this.msgSrv.error('未正确配置爬虫参数,请关闭页面');
      return;
    }
    try {
      crawlingMsgId = this.msgSrv.loading(`${this.record.crawlKey}爬取中`, { nzDuration: 0 }).messageId;
      switch (this.record.crawlType) {
        case 0:
          this.i = null; //js中空对象并不为假值,置假应该用null
          this.msgSrv.remove(crawlingMsgId);
          this.msgSrv.error('未指定数据源,请关闭页面');
          return;
        case 1:
          this.i = (await this.crawlService.crawlJavBusVideo(this.commonService.recognizeSerialNumber(this.record.crawlKey))) || {};
          break;
        case 2:
          this.i = (await this.crawlService.crawlBrazzersVideo({ crawlKey: this.record.crawlKey })) || {};
          break;
        case 3:
          this.i = (await this.crawlService.crawlTransAngelsVideo({ crawlKey: this.record.crawlKey })) || {};
          break;
        default:
          this.i = null;
          this.msgSrv.remove(crawlingMsgId);
          this.msgSrv.error('无法识别数据源,请关闭页面');
          return;
      }
      // this.i.serialNumber = this.record.serialNumber.toUpperCase(); //只接受处理完的符合网站链接标准的番号
      this.coverSrc = this.i.coverSrc;
      this.javUrl = this.commonService.buildJavbusLink(this.i.serialNumber)
      this.btdigUrl = this.commonService.buildBtdiggLink(this.i.serialNumber)
      this.nyaaUrl = this.commonService.buildNyaaLink(this.i.serialNumber)
      this.previewImageSrcList = Array.isArray(this.i.previewImageSrcList) ? this.i.previewImageSrcList : []

      this.enterSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
        if (event.key == 'Enter') {
          this.save(this.sf.value);
        }
      })
      this.msgSrv.remove(crawlingMsgId);
      this.msgSrv.success('信息爬取成功');
    } catch (error) {
      console.error(error)
      this.msgSrv.remove(crawlingMsgId);
      this.msgSrv.error('信息爬取失败');
      this.close();
    }
  }

  ngAfterViewInit() {

  }

  async save(value: any) {
    try {
      this.drawer.close({ state: 'ok', data: value });
    } catch (error) {}
  }

  close(): void {
    this.drawer.close({ state: 'cancel', data: {} });
  }

  ngOnDestroy() {
    this.coverSrc = ''
    if (this.enterSubscription) {
      this.enterSubscription.unsubscribe();
    }
  }

  protected readonly dateStringFormatter = dateStringFormatter;
}
