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
      tags: { type: 'string', title: '标签' },
      htmlText: { type: 'string', title: '文本' },
    },
    required: ['tag'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 }
    },
    $tags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择标签',
      mode: 'multiple',
      asyncData: () => this.videoTagService.getSelectAll('tagChinese')
    },
    $htmlText: {
      widget: 'text',
      defaultText: '-',
      html: true
    }
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
      this.msgSrv.remove(crawlingMsgId);
      this.msgSrv.success('爬取信息成功');
    } catch (error) {
      this.msgSrv.remove(crawlingMsgId);
      this.msgSrv.error('爬取信息失败');
      this.close();
    }
  }

  async save(value: any) {
    try {
      this.msgSrv.success('保存成功');
      this.drawer.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.drawer.close();
  }
}
