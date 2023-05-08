import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AreaService } from '../../../../service/area/area.service';
import { CastService } from '../../../../service/cast/cast.service';
import { CommonService } from '../../../../service/common/common.service';
import { VideoTagService } from '../../../../service/video/video-tag.service';
import { VideoTypeService } from '../../../../service/video/video-type.service';
import { VideoService } from '../../../../service/video/video.service';

@Component({
  selector: 'app-video-manage-video-edit',
  templateUrl: './video-edit.component.html'
})
export class VideoManageVideoEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      title: { type: 'string', title: '标题' },
      existSerialNumber: { type: 'boolean', title: '有无番号' },
      serialNumber: { type: 'string', title: '番号', maxLength: 15 },
      videoType: { type: 'string', title: '类型' },
      publishTime: { type: 'string', title: '发行日期', format: 'date' },
      duration: { type: 'number', title: '时长' },
      director: { type: 'string', title: '导演' },
      producer: { type: 'string', title: '制作商' }, // 日本常用
      releaser: { type: 'string', title: '发行商' }, // 日本常用
      brand: { type: 'string', title: '厂牌' }, // 欧美常用
      inSeries: { type: 'boolean', title: '是否系列作品' },
      series: { type: 'string', title: '系列' },
      // area: { type: 'string', title: '地区' },
      // addTime: { type: 'string', title: '添加时间', format: 'date-time' },
      tags: { type: 'string', title: '标签' },
      stars: { type: 'string', title: '演员' },
      description: { type: 'string', title: '描述', maxLength: 140 }
    },
    required: ['title']
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 120,
      grid: { span: 22 }
    },
    $title: {},
    $videoType: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择视频类型',
      width: 400,
      asyncData: () => this.videoTypeService.getSelectAll()
    },
    $duration: {
      unit: '分钟',
      widgetWidth: 150,
      precision: 0
    },
    $director: {
      visibleIf: {
        videoType: val => val == 2 || val == 3
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择导演',
      asyncData: () => this.videoTagService.getSelectAll()
    },
    $producer: {
      visibleIf: {
        videoType: val => val == 2
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择制作商',
      asyncData: () => this.videoTagService.getSelectAll()
    },
    $releaser: {
      visibleIf: {
        videoType: val => val == 2
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择发行商',
      asyncData: () => this.videoTagService.getSelectAll()
    },
    $brand: {
      visibleIf: {
        videoType: val => val == 3
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择厂牌',
      asyncData: () => this.videoTagService.getSelectAll()
    },
    $series: {
      visibleIf: {
        inSeries: val => val
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择系列',
      asyncData: () => this.videoTagService.getSelectAll()
    },
    $area: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择地区',
      width: 400,
      asyncData: () => this.videoAreaService.getSelectAll()
    },
    $existSerialNumber: {
      checkedChildren: '有',
      unCheckedChildren: '无',
      // grid: { span: 5 }
    },
    $serialNumber: {
      // spanLabelFixed: 0,
      // grid: { span: 19 },
      visibleIf: {
        existSerialNumber: val => val
      }
    },
    $stars: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择演员',
      mode: 'multiple',
      asyncData: () => this.castService.getSelectAll()
    },
    $tags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择标签',
      mode: 'multiple',
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

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private commonService: CommonService,
    private castService: CastService,
    private videoService: VideoService,
    private videoTagService: VideoTagService,
    private videoTypeService: VideoTypeService,
    private videoAreaService: AreaService
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
}
