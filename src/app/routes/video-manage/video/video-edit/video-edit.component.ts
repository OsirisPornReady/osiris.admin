import {Component, OnInit, AfterViewInit, ViewChild, QueryList, ViewChildren} from '@angular/core';
import {SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient, DrawerHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AreaService } from '../../../../service/area/area.service';
import { CastService } from '../../../../service/cast/cast.service';
import { CommonService } from '../../../../service/common/common.service';
import { VideoQualityService } from '../../../../service/video/video-quality.service';
import { VideoTagService } from '../../../../service/video/video-tag.service';
import { VideoTypeService } from '../../../../service/video/video-type.service';
import { VideoService } from '../../../../service/video/video.service';

import { VideoManageVideoCrawlInfoComponent } from '../video-crawl/video-crawl-info/video-crawl-info.component';

@Component({
  selector: 'app-video-manage-video-edit',
  templateUrl: './video-edit.component.html'
})
export class VideoManageVideoEditComponent implements OnInit, AfterViewInit {
  title = '';
  record: any = {};
  i: any;
  @ViewChildren(SFComponent) sfList!: QueryList<SFComponent>;
  @ViewChildren('sf') sf!: SFComponent;
  safeSF!: SFComponent;
  schema: SFSchema = {
    properties: {
      title: { type: 'string', title: '标题' },
      onStorage: { type: 'boolean', title: '入库情况' },
      existSerialNumber: { type: 'boolean', title: '有无番号' },
      serialNumber: { type: 'string', title: '番号', maxLength: 15 },
      crawlInfoButton: { type: 'string', title: '导入' },
      videoType: { type: 'string', title: '类型' },
      videoResolution: { type: 'string', title: '分辨率' },
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
    $onStorage: {
      checkedChildren: '已入库',
      unCheckedChildren: '未入库'
    },
    $videoType: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择视频类型',
      width: 400,
      asyncData: () => this.videoTypeService.getSelectAll()
    },
    $videoResolution: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择视频分辨率',
      width: 400,
      asyncData: () => this.videoQualityService.getSelectAll()
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
    $crawlInfoButton: {
      visibleIf: {
        existSerialNumber: val => val
      },
      widget: 'custom'
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
      asyncData: () => this.videoTagService.getSelectAll('tagChinese')
    },
    $description: {
      widget: 'textarea',
      autosize: { minRows: 3, maxRows: 6 }
    },
    $publishTime: {
      widget: 'date'
    },
    $addTime: {
      widget: 'date'
    }
  };

  CrawlerData: any = {};
  needAutoFill: boolean = false;
  autoFillMseId: string = '';

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private commonService: CommonService,
    private castService: CastService,
    private videoService: VideoService,
    private videoTagService: VideoTagService,
    private videoTypeService: VideoTypeService,
    private videoAreaService: AreaService,
    private videoQualityService: VideoQualityService,
    private drawer: DrawerHelper
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

  ngAfterViewInit() {
    this.sfList.changes.subscribe(() => {
      let sfArray = this.sfList.toArray()
      if (sfArray.length > 0) {
        this.safeSF = sfArray[0];
        this.autoFillForm()
      }
      console.log(this.safeSF)
    })
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

  crawlInfo(value: any) {
    if (value.existSerialNumber) {
      if (value.serialNumber) {
        this.drawer.static('爬取信息', VideoManageVideoCrawlInfoComponent, { record: value }, { size: 700 }).subscribe(res => {
          if (res.state == 'ok') {
            this.CrawlerData = res.data;
            this.needAutoFill = true;
            this.autoFillForm();
          }
        });
      } else {
        this.msgSrv.info('番号为空');
      }
    } else {
      this.msgSrv.info('未配置番号');
    }
  }

  autoFillForm() {
    if (!this.needAutoFill) { return; }
    this.autoFillMseId = this.msgSrv.loading(`表单自动填充中`, { nzDuration: 0 }).messageId;
    let { publishTime, director, producer, releaser, series, stars, ...fillData } = this.CrawlerData;
    let originData = JSON.parse(JSON.stringify(this.safeSF.value));
    Object.keys(fillData).forEach((key: string) => {
      if (originData.hasOwnProperty(key)) {
        try {
          this.safeSF.setValue(`/${key}`, fillData[key])
        } catch (e) {
          console.error(`自动填充字段${key}失败`, e)
        }
      }
    })
    this.msgSrv.remove(this.autoFillMseId);
    this.msgSrv.success('自动填充完成');
    this.needAutoFill = false;
  }

}
