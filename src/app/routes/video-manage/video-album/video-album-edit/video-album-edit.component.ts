import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { VideoAlbumService } from '../../../../service/video/video-album.service';
import { VideoService } from '../../../../service/video/video.service';

@Component({
  selector: 'app-video-manage-video-album-edit',
  templateUrl: './video-album-edit.component.html',
})
export class VideoManageVideoAlbumEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      albumName: { type: 'string', title: '专辑名' },
      videoList: { type: 'string', title: '专辑视频' },
      // addButton: { type: 'string', title: '' },
      videoDetail: { type: 'string', title: '专辑细则' },
    },
    required: ['albumName'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
    $videoList: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择视频',
      mode: 'multiple',
      maxTagCount: 1,
      asyncData: () => this.videoService.getSelectAll('title'),
      change: (value: any, orgData: any) => this.syncToDetail(orgData)
    },
    $addButton: {
      widget: 'custom',
    },
    $videoDetail: {
      widget: 'custom',
    }
  };

  videoDetailList: any[] = []

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoAlbumService: VideoAlbumService,
    private videoService: VideoService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改';
      this.i = (await this.videoAlbumService.getById(this.record.id)) || {};
    } else {
      this.title = '新增';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      if (this.record.id > 0) {
        await this.videoAlbumService.update(value);
      } else {
        await this.videoAlbumService.add(value);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

  syncToDetail(value: any) {
    this.videoDetailList = value;
  }
}
