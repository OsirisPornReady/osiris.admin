import {Component, OnInit, ViewChild} from '@angular/core';
import {SFComponent, SFSchema, SFUISchema} from '@delon/form';
import {_HttpClient} from '@delon/theme';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef} from 'ng-zorro-antd/modal';

import {VideoService} from '../../../../service/video/video.service';
import {CommonService} from '../../../../service/common/common.service';

@Component({
  selector: 'app-video-manage-local-video-edit',
  templateUrl: './local-video-edit.component.html',
})
export class VideoManageLocalVideoEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent
  schema: SFSchema = {
    properties: {
      uploadMethod: {
        type: 'string', title: '导入方式',
        ui: {
          widget: 'custom'
        }
      },
      title: { type: 'string', title: '标题' },
      remark: {
        type: 'string', title: '备注',
        ui: {
          widget: 'textarea'
        }
      },
      uploadButton: {
        type: 'string', title: '操作',
        ui: {
          widget: 'custom'
        }
      },
    },
    required: ['title'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 145,
      grid: { span: 22 },
    },
  };

  localVideoPathList: string[] = [];
  dialogType: string = 'multiple-files';
  dialogTypeOptions: any[] = [
    { label: '文件', value: 'file' },
    { label: '多选文件', value: 'multiple-files' },
    { label: '文件夹', value: 'directory' },
  ]
  loading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoService: VideoService,
    private commonService: CommonService,
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改本地视频资源';
      let res = (await this.videoService.getLocalVideoById(this.record.id)) || {}
      res.pathList = res.pathList || []
      this.i = res;
      this.localVideoPathList = res.pathList;
    } else {
      this.title = '导入本地视频资源';
      this.i = {
        title: this.record.videoInfo.title
      };
    }
  }

  async save(value: any) {
    this.loading = true;
    try {
      let pathList: any[] = this.localVideoPathList;
      let entity: any = {
        videoId: this.record.videoInfo.id,
        ...value,
      };
      entity.pathList = pathList;
      if (this.record.id > 0) {
        await this.videoService.updateLocalVideo(entity);
      } else {
        await this.videoService.addLocalVideo(entity);
      }
      this.msgSrv.success('本地Video导入成功');
      this.modal.close('ok');
    } catch (e) {
      console.error(e)
      this.msgSrv.error('本地Video导入失败');
    }
    this.loading = true;
  }

  reset() {
    this.localVideoPathList = []
    this.sf.reset();
  }

  close(): void {
    this.modal.destroy();
  }

  async openFileDialog() {
    try {
      let res: any = (await this.videoService.openFileDialog({
        dialogType: this.dialogType
      })) || {};
      if (res.hasOwnProperty('pathList')) {
        let pathList = res.pathList || [];
        pathList.forEach((item: any) => this.localVideoPathList.push(item));
      }
    } catch (e) {
      console.error(e);
      this.msgSrv.error('文件对话框打开失败');
    }
  }

  deleteFromPathList(index: number) {
    this.localVideoPathList.splice(index, 1);
  }

  swapPathOrder(posA: number, posB: number) {
    [this.localVideoPathList[posA], this.localVideoPathList[posB]] = [this.localVideoPathList[posB], this.localVideoPathList[posA]];
  }

  sortPathOrder() {
    this.localVideoPathList.sort((a: any, b: any) => {
      return a.toString().length - b.toString().length;
    });
  }

  clearPathList() {
    this.localVideoPathList = [];
  }

}
