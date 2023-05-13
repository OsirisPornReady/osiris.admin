import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { fromEvent } from "rxjs";

import { VideoTagService } from '../../../../../service/video/video-tag.service';
import { VideoService } from '../../../../../service/video/video.service';
import { CommonService } from '../../../../../service/common/common.service';

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
      publishTime: { type:'string', title: '发布时间' },
      duration: { type:'string', title: '时长' },
      director: { type:'string', title: '导演' },
      producer: { type:'string', title: '制作商' },
      releaser: { type:'string', title: '发行商' },
      series: { type:'string', title: '系列' },
      stars: { type:'string', title: '演员' },
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
    $tags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择标签',
      mode: 'multiple',
      asyncData: () => this.videoTagService.getSelectAll('tagChinese')
    },
    $stars: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择标签',
      mode: 'tags',
      default: null
    },
  };

  serialNumber: string = ''
  coverSrc: string = ''
  javUrl: string = ''
  btdigUrl: string = ''
  nyaaUrl: string = ''
  previewImageSrcList: string[] = []; //'1','2','3','4','5','6','7','8','9','10','11','12'
  enterSubscription: any = null;

  constructor(
    private drawer: NzDrawerRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoTagService: VideoTagService,
    private videoService: VideoService,
    private commonService: CommonService
  ) {}

  async ngOnInit() {
    let crawlingMsgId = '';
    try {
      crawlingMsgId = this.msgSrv.loading(`${this.record.serialNumber}爬取中`, { nzDuration: 0 }).messageId;
      this.i = (await this.videoService.crawlInfoBySerialNumber(this.record.serialNumber)) || {};
      if (this.record.id > 0) {} else {
        this.i.existSerialNumber = true;
      }
      // this.i.serialNumber = this.record.serialNumber.toUpperCase(); //只接受处理完的符合网站链接标准的番号
      this.serialNumber = this.i.serialNumber;
      this.title = `${this.i.serialNumber} ${this.i.title}`
      this.coverSrc = this.i.coverSrc;
      this.javUrl = this.commonService.buildJavbusLink(this.i.serialNumber)
      this.btdigUrl = this.commonService.buildBtdiggLink(this.i.serialNumber)
      this.nyaaUrl = this.commonService.buildNyaaLink(this.i.serialNumber)
      this.enterSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
        if (event.key == 'Enter') {
          this.save(this.sf.value);
        }
      })
      this.msgSrv.remove(crawlingMsgId);
      this.msgSrv.success('信息爬取成功');
    } catch (error) {
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
}
