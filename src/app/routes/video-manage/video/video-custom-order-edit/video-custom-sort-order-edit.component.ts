import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { VideoService } from '../../../../service/video/video.service';

@Component({
  selector: 'app-video-manage-video-custom-sort-order-edit',
  templateUrl: './video-custom-sort-order-edit.component.html',
})
export class VideoManageVideoCustomSortOrderEditComponent implements OnInit {

  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent
  schema: SFSchema = {
    properties: {
      customSortOrder: { type: 'number', title: '自定义顺序' },
    },
    required: ['customSortOrder'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 120,
      grid: { span: 22 },
    },
    $customSortOrder: {

    },
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoService: VideoService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '自定义顺序';
      let res = (await this.videoService.getById(this.record.id)) || {};
      this.i = {  // 少量更新可以用这种方法,这样不用写多余接口,前提是update接口为忽略null的策略
        id: res?.id,
        customSortOrder: res?.customSortOrder
      }
    } else {
      this.title = '自定义顺序';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      if (this.record.id > 0) {
        await this.videoService.update(value);
      } else {
        await this.videoService.add(value);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

}
