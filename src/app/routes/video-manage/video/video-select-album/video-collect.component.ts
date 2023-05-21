import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { VideoService } from '../../../../service/video/video.service';
import { VideoAlbumService } from '../../../../service/video/video-album.service';
import { CommonService } from '../../../../service/common/common.service';

@Component({
  selector: 'app-video-manage-video-collect',
  templateUrl: './video-collect.component.html',
})
export class VideoManageVideoCollectComponent implements OnInit {
  originCollectionList: number[] = [];

  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent
  schema: SFSchema = {
    properties: {
      albumList: { type: 'string', title: '专辑' },
    },
    required: [],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 120,
      grid: { span: 22 },
    },
    $albumList: {
      widget: 'select',
      allowClear: true,
      autoClearSearchValue: false,
      placeholder: '请选择专辑',
      mode: 'multiple',
      asyncData: () => this.videoAlbumService.getSelectAll(),
    },
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoService: VideoService,
    private videoAlbumService: VideoAlbumService,
    private commonService: CommonService,
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '视频收藏';
      let res = (await this.videoAlbumService.getAlbumCollectedVideo(this.record.id)) || [];
      this.i = {
        albumList: res?.map((item: any) => {
          return item.id
        })
      }
      this.originCollectionList = this.i.albumList;
    } else {
      this.title = '视频收藏';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      value.id = this.record.id;
      let removeFromList: number[] = [];
      let addToList: number[] = [];
      if (!value.albumList) { value.albumList = []; }
      removeFromList = this.originCollectionList.filter((i: any) => {
        return !value.albumList.includes(i)
      })
      addToList = value.albumList.filter((i: any) => {
        return !this.originCollectionList.includes(i)
      })
      value.removeFromList = removeFromList;
      value.addToList = addToList;
      await this.videoAlbumService.collectVideo(value);
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

}
