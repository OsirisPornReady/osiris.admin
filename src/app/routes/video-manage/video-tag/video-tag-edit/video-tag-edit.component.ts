import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { VideoTagService } from '../../../../service/video/video-tag.service';

@Component({
  selector: 'app-video-manage-video-tag-edit',
  templateUrl: './video-tag-edit.component.html',
})
export class VideoManageVideoTagEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      tag: { type: 'string', title: '标签' },
    },
    required: ['tag'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoTagService: VideoTagService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改';
      this.i = (await this.videoTagService.getById(this.record.id)) || {};
    } else {
      this.title = '新增';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      if (this.record.id > 0) {
        await this.videoTagService.update(value);
      } else {
        await this.videoTagService.add(value);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }
}
