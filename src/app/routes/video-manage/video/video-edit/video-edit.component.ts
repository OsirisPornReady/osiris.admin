import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { ActorService } from '../../../../service/actor/actor.service';
import { CommonService } from '../../../../service/common/common.service';
import { VideoService } from '../../../../service/video/video.service';
import { VideoTagService } from "../../../../service/video/video-tag.service";

@Component({
  selector: 'app-video-manage-video-edit',
  templateUrl: './video-edit.component.html',
})
export class VideoManageVideoEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      title: { type: 'string', title: '标题' },
      existSerialNumber: { type: 'boolean', title: '番号' },
      serialNumber: { type: 'string', title: '', maxLength: 15 },
      videoType: { type: 'string', title: '类型' },
      area: { type: 'string', title: '地区' },
      publishTime: { type: 'string', title: '发布时间', format: 'date' },
      addTime: { type: 'string', title: '添加时间', format: 'date-time' },
      cast: { type: 'string', title: '演员' },
      tags: {
        type: 'string',
        title: '标签',
        enum: [
          { value: 1, label: '电影' },
          { value: 2, label: '书' },
          { value: 3, label: '旅行' },
        ],
      },
      description: { type: 'string', title: '描述', maxLength: 140 },
    },
    required: ['description'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 120,
      grid: { span: 24 }
    },
    $title: {},
    $videoType: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择视频类型',
      width: 400,
      asyncData: () => this.videoService.getSelectAll()
    },
    $area: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择地区',
      width: 400
    },
    $existSerialNumber: {
      checkedChildren: '有',
      unCheckedChildren: '无',
      grid: { span: 5 }
    },
    $serialNumber: {
      spanLabelFixed: 0,
      grid: { span: 19 },
      visibleIf: {
        existSerialNumber: val => val
      }
    },
    $cast: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择演员',
      mode: 'tags',
      default: null,
      asyncData: () => this.actorService.getSelectList()
    },
    $tags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择标签',
      mode: 'tags',
      default: null,
      asyncData: () => this.videoTagService.getSelectAll()
    },
    $description: {
      widget: 'textarea',
      autosize: {
        minRows: 3,
        maxRows: 6
      }
    },
    $publishTime: {
      widget: 'date'
    },
    $addTime: {
      widget: 'date'
    }
  };

  editTag: any;
  tagEditState: boolean = false;
  tagList: any[] = ['tag1', 'tag2', 'tag3'];
  bulkTagIndexHash: any = {};

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private commonService: CommonService,
    private videoService: VideoService,
    private actorService: ActorService,
    private videoTagService: VideoTagService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改';
      this.i = (await this.videoService.getById(this.record.id)) || {};
    } else {
      this.title = '新增';
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

  switchTagEdit() {
    this.tagEditState = !this.tagEditState;
  }

  addTag(value: any) {
    this.tagList.push(this.editTag);
    this.editTag = '';
  }

  delTag(tag: any, index: number) {
    this.tagList.splice(index, 1);
  }

  bulkSelectTag(event: any, tag: any, index: number) {
    if (event) {
      this.bulkTagIndexHash[index] = true;
    } else {
      this.bulkTagIndexHash[index] = false;
    }
  }

  bulkDelTag() {
    this.tagList = this.tagList.filter((item: any, index: number) => {
      if (this.bulkTagIndexHash.hasOwnProperty(index)) {
        return !this.bulkTagIndexHash[index];
      } else {
        return true;
      }
    });
    this.bulkTagIndexHash = {};
  }
}
