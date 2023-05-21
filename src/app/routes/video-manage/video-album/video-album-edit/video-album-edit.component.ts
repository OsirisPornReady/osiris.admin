import {Component, OnInit, ViewChild} from '@angular/core';
import {SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { VideoAlbumService } from '../../../../service/video/video-album.service';
import { VideoService } from '../../../../service/video/video.service';
import {lastValueFrom} from "rxjs";

@Component({
  selector: 'app-video-manage-video-album-edit',
  templateUrl: './video-album-edit.component.html',
  styleUrls: ['./video-album-edit.component.less']
})
export class VideoManageVideoAlbumEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf', { static: false }) sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      albumName: { type: 'string', title: '专辑名' },
      albumVideoList: { type: 'string', title: '专辑视频', enum: [] },
      selectedVideo: { type: 'string', title: '视频列表', enum: [] },
      addButton: { type: 'string', title: '' },
      videoDetailList: { type: 'string', title: '专辑细则' },
    },
    required: ['albumName'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
    $albumVideoList: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择视频',
      mode: 'multiple',
      maxTagCount: 1,
      // asyncData: () => this.videoService.getSelectAll('title'),
      change: (value: any, orgData: any) => this.syncToDetail(value, orgData)
    },
    $selectedVideo: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择要添加视频',
      // asyncData: () => this.videoService.getSelectAll('title'),
      change: (value: any, orgData: any) => this.selectedVideoDetail = orgData
    },
    $addButton: {
      widget: 'custom',
    },
    $videoDetailList: {
      widget: 'custom',
    }
  };

  enum: any[] = []
  selectedVideoDetail: any = null;
  videoDetailList: any[] = []

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoAlbumService: VideoAlbumService,
    private videoService: VideoService
  ) {}

  async ngOnInit() {
    try {
      this.enum = await lastValueFrom(this.videoService.getSelectAll('title')) || [];
      // tsconfig.json
      //"compilerOptions": {
      // // ...
      //   "noPropertyAccessFromIndexSignature": false,
      // // ...
      // }
      // 可能是lint的问题,某些选项去了就能用点取属性了
      this.schema.properties!['albumVideoList']!.enum = this.enum;
      this.schema.properties!['selectedVideo']!.enum = this.enum;
      this.sf?.refreshSchema();  // 不加问号也可以,只是console会报错误信息,推测可能是onPush更新策略引起的
    } catch (e) {
      console.error(e)
      this.msgSrv.error('请求视频列表失败')
    }

    // this.videoService.getSelectAll('title').subscribe(res => {
    //   this.enum = res || [];
    //   this.schema.properties!['albumVideoList']!.enum = this.enum;
    //   this.schema.properties!['videoList']!.enum = this.enum;
    //   this.sf?.refreshSchema();
    // })

    if (this.record.id > 0) {
      this.title = '修改';
      try {
        this.i = (await this.videoAlbumService.getById(this.record.id)) || {};
        let albumVideoList: any[] = this.i?.albumVideoList || [];
        this.videoDetailList = this.enum.filter((item: any) => {
          return albumVideoList.includes(item.value)
        })
      } catch (e) {
        console.error(e)
        this.msgSrv.error('请求数据失败')
      }
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

  syncToDetail(value: any, orgData: any) {
    this.videoDetailList = orgData;
  }

  addToAlbumVideoList() {
    if (!this.selectedVideoDetail) {
      this.msgSrv.info('未选择要添加的视频');
      return;
    }
    let albumVideoList: any[] = this.sf.getValue('/albumVideoList')! || []
    if (albumVideoList.includes(this.selectedVideoDetail.value)) {
      this.msgSrv.info('专辑里已有此视频');
      return;
    }
    albumVideoList.push(this.selectedVideoDetail.value);
    this.sf.getProperty('/albumVideoList')!.setValue(albumVideoList, false);
    this.sf.getProperty('/albumVideoList')!.widget.reset(albumVideoList);
    this.videoDetailList.push(this.selectedVideoDetail)
  }

  deleteFromAlbumVideoList(item: any) {
    let albumVideoList: any[] = this.sf.getValue('/albumVideoList')! || []
    albumVideoList = albumVideoList.filter((i: any) => i != item.value);
    this.sf.getProperty('/albumVideoList')!.setValue(albumVideoList, false);
    this.sf.getProperty('/albumVideoList')!.widget.reset(albumVideoList);
    this.videoDetailList = this.videoDetailList.filter((i: any) => i.value != item.value);
  }
}
