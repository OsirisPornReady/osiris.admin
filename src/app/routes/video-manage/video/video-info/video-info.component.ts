import { Component, OnInit, OnDestroy } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VideoTagService } from '../../../../service/video/video-tag.service';
import { VideoService } from '../../../../service/video/video.service';

@Component({
  selector: 'app-video-manage-video-info',
  templateUrl: './video-info.component.html',
})
export class VideoManageVideoInfoComponent implements OnInit, OnDestroy {
  title = '';
  record: any = {};
  i: any;
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
      spanLabelFixed: 75,
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

  constructor(
    private drawer: NzDrawerRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoTagService: VideoTagService,
    private videoService: VideoService
  ) {}

  async ngOnInit() {
    // let crawlingMsgId = '';
    // try {
    //   crawlingMsgId = this.msgSrv.loading(`${this.record.serialNumber}爬取中`, { nzDuration: 0 }).messageId;
    //   this.i = (await this.videoService.crawlInfoBySerialNumber(this.record.serialNumber)) || {};
    //   if (this.record.id > 0) {} else {
    //     this.i.existSerialNumber = true;
    //   }
    //   // this.i.serialNumber = this.record.serialNumber.toUpperCase(); //只接受处理完的符合网站链接标准的番号
    //   this.serialNumber = this.i.serialNumber;
    //   this.title = this.i.title
    //   this.coverSrc = this.i.coverSrc;
    //   this.javUrl = `https://www.javbus.com/${this.i.serialNumber}`
    //   this.msgSrv.remove(crawlingMsgId);
    //   this.msgSrv.success('信息爬取成功');
    // } catch (error) {
    //   this.msgSrv.remove(crawlingMsgId);
    //   this.msgSrv.error('信息爬取失败');
    //   this.close();
    // }
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
  }
}
