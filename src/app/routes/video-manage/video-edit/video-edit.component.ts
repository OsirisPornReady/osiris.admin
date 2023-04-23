import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { CommonService } from '../../../service/common/common.service';
import { VideoService } from '../../../service/video/video.service';

@Component({
  selector: 'app-video-manage-video-edit',
  templateUrl: './video-edit.component.html',
})
export class VideoManageVideoEditComponent implements OnInit {
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      title: { type: 'string', title: '标题' },
      videoType: { type: 'string', title: '类型' },
      area: { type: 'string', title: '地区' },
      publishTime: { type: 'string', title: '发布时间', format: 'date' },
      addTime: { type: 'string', title: '添加时间', format: 'date-time' },
      existSerialNumber: { type: 'boolean', title: '番号' },
      serialNumber: { type: 'string', title: '', maxLength: 15 },
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
      asyncData: () => this.commonService.getSelectList()
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
    $tags: {
      widget: 'custom'
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
    private videoService: VideoService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    if (this.record.id > 0)
    this.http.get(`/user/${this.record.id}`).subscribe(res => (this.i = res));
  }

  async save(value: any) {
    // this.http.post(`/user/${this.record.id}`, value).subscribe(res => {
    //   this.msgSrv.success('保存成功');
    //   this.modal.close(true);
    // });

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

  protected readonly open = open;

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
