import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VideoTagService } from '../../../../service/video/video-tag.service';

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
      tag: { type: 'string', title: '标签' },
      tagChinese: { type: 'string', title: '中文标签' },
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
  };

  constructor(
    private drawer: NzDrawerRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoTagService: VideoTagService
  ) {}

  ngOnInit() {
    console.log('爬取信息', this.i);
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
