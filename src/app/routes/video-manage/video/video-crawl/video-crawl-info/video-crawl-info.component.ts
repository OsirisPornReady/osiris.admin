import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VideoTagService } from '../../../../../service/video/video-tag.service';
import { VideoService } from '../../../../../service/video/video.service';

@Component({
  selector: 'app-video-manage-video-crawl-info',
  templateUrl: './video-crawl-info.component.html',
})
export class VideoManageVideoCrawlInfoComponent implements OnInit {
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
      spanLabelFixed: 100,
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

  constructor(
    private drawer: NzDrawerRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoTagService: VideoTagService,
    private videoService: VideoService
  ) {}

  async ngOnInit() {
    let crawlingMsgId = '';
    try {
      crawlingMsgId = this.msgSrv.loading(`${this.record.serialNumber}爬取中`, { nzDuration: 0 }).messageId;
      this.i = (await this.videoService.crawlInfoBySerialNumber(this.record.serialNumber)) || {};
      this.i.serialNumber = this.record.serialNumber.toUpperCase();
      this.msgSrv.remove(crawlingMsgId);
      this.msgSrv.success('信息爬取成功');
    } catch (error) {
      this.msgSrv.remove(crawlingMsgId);
      this.msgSrv.error('信息爬取失败');
      this.close();
    }
  }

  async save(value: any) {
    try {
      this.drawer.close({ state: 'ok', data: value });
    } catch (error) {}
  }

  close(): void {
    this.drawer.close({ state: 'cancel', data: {} });
  }
}
