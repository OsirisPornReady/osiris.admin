import {Component, OnInit, AfterViewInit, ViewChild, QueryList, ViewChildren} from '@angular/core';
import {SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient, DrawerHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AreaService } from '../../../../service/area/area.service';
import { CastService } from '../../../../service/cast/cast.service';
import { CommonService } from '../../../../service/common/common.service';
import { CrawlTypeService } from '../../../../service/crawl/crawl-type.service';
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
  @ViewChild('sf') sf!: SFComponent;
  safeSF!: SFComponent;
  schema: SFSchema = {
    properties: {
      canCrawl: { type: 'boolean', title: '是否需要导入' },
      crawlType: { type: 'string', title: '导入数据源' },
      crawlKey: { type: 'string', title: '导入关键字' },
      crawlButton: { type: 'string', title: '导入' },
      title: { type: 'string', title: '标题' },
      score: { type: 'number', title: '评分', maximum: 10, multipleOf: 1 },
      onStorage: { type: 'boolean', title: '入库情况' },
      videoSrc: { type: 'string', title: '视频地址' },
      existSerialNumber: { type: 'boolean', title: '有无番号' },
      serialNumber: { type: 'string', title: '番号', maxLength: 15 },
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
      isClassified: { type: 'boolean', title: '已分类' },
      stars: { type: 'string', title: '分类演员' },
      tags: { type: 'string', title: '分类标签' },
      starsRaw: { type: 'string', title: '演员' },
      tagsRaw: { type: 'string', title: '标签' },
      description: { type: 'string', title: '描述' }
    },
    required: ['title']
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 120,
      grid: { span: 22 }
    },
    $title: { placeholder: '输入标题' },
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
      placeholder: '请选择导演',
    },
    $producer: {
      visibleIf: {
        videoType: val => val == 2
      },
      placeholder: '请选择制作商',
    },
    $releaser: {
      visibleIf: {
        videoType: val => val == 2
      },
      placeholder: '请选择发行商',
    },
    $brand: {
      visibleIf: {
        videoType: val => val == 3
      },
      placeholder: '请选择厂牌',
    },
    $series: {
      visibleIf: {
        inSeries: val => val
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择系列',
      mode: 'tags',
      default: null,
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
    $crawlType: {
      visibleIf: {
        canCrawl: val => val
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择视频分辨率',
      width: 400,
      asyncData: () => this.crawlTypeService.getSelectAll()
    },
    $crawlKey: {
      visibleIf: {
        canCrawl: val => val
      }
    },
    $crawlButton: {
      visibleIf: {
        canCrawl: val => val
      },
      widget: 'custom'
    },
    $isClassified: {
      checkedChildren: '已分类',
      unCheckedChildren: '未分类',
    },
    $stars: {
      visibleIf: {
        isClassified: val => val
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择演员',
      mode: 'multiple',
      asyncData: () => this.castService.getSelectAll()
    },
    $tags: {
      visibleIf: {
        isClassified: val => val
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择标签',
      mode: 'multiple',
      asyncData: () => this.videoTagService.getSelectAll('tagChinese')
    },
    $starsRaw: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择演员',
      mode: 'tags',
      default: null,
    },
    $tagsRaw: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择标签',
      mode: 'tags',
      default: null,
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
    },
    $videoSrc: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入视频地址(可多个值)',
      mode: 'tags',
      default: null,
    },
    $score: {
      // widget: 'custom'
      widget: 'rate',
      text: ` {{value}} 分`
    }
  };

  automatedMsgId: string = '';
  automated: boolean = false;
  automatedData: any = {};

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private commonService: CommonService,
    private crawlTypeService: CrawlTypeService,
    private castService: CastService,
    private videoService: VideoService,
    private videoTagService: VideoTagService,
    private videoTypeService: VideoTypeService,
    private videoAreaService: AreaService,
    private videoQualityService: VideoQualityService,
    private drawer: DrawerHelper,
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
    //由于sf组件没有足够的钩子,只能出此下策
    if (this.record.id > 0) {
      this.sfList.changes.subscribe(() => {
        let sfArray = this.sfList.toArray();
        if (sfArray.length > 0) {
          this.safeSF = sfArray[0];
          // promise语法糖,相当于
          // new Promise((resolve) => {
          //   resolve(42)
          // })
          Promise.resolve().then(async () => { // 应对Error: NG0100,用setTimeout(() => {}, 0)也可以,相当于在第二次更新检测时再更新值,类似vue中的nextTick
            if (this.automated) {
              await this.automatedOperate();
            }
          })
        }
      })
    } else {
      this.safeSF = this.sf
      // this.safeSF.validator()
      Promise.resolve().then(async () => { // 应对Error: NG0100,用setTimeout(() => {}, 0)也可以,相当于在第二次更新检测时再更新值,类似vue中的nextTick
        if (this.automated) {
          await this.automatedOperate();
        }
      })
    }
  }

  async save(value: any) {
    // const params = { ...value };
    // params.id = this.record.id;
    // sf的机制让它不会收集为null的数据,不符合后端VideoDTO,提交params会出错
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
    if (value.hasOwnProperty('crawlKey') && value.hasOwnProperty('crawlType')) {
      this.drawer.create('爬取信息', VideoManageVideoCrawlInfoComponent, { record: value }, { size: 1600, drawerOptions: { nzClosable: false } }).subscribe(async res => {
        if (res.state == 'ok') {
          this.automatedData = res.data;
          this.automated = true;
          await this.automatedOperate();
        }
      });
    } else {
      this.msgSrv.info('请配置爬虫关键字与爬虫数据源');
    }
  }

  async automatedOperate() { //进入这个函数代表有自动化行为,就在这里判断是否有重复视频
    this.autoFillForm();
    // try {
    //   let title = this.safeSF.getValue('/title');
    //   let isTitleExist: boolean = await this.videoService.isTitleExist(title);
    //   if (isTitleExist) {
    //     this.msgSrv.warning('此标题已存在');
    //   }
    // } catch (e) {}
    await this.autoSubmitForm();
  }

  autoFillForm() {
    if (!this.commonService.isAutoFill) { return; }
    this.automatedMsgId = this.msgSrv.loading(`表单自动填充中`, { nzDuration: 0 }).messageId;
    let { stars, coverSrc, ...fillData } = this.automatedData;
    Object.keys(fillData).forEach((key: string) => {
      try {
        this.safeSF.setValue(`/${key}`, fillData[key])
      } catch (e) {
        console.error(`自动填充字段${key}失败`, e)
      }
    })
    this.msgSrv.remove(this.automatedMsgId);
    this.msgSrv.success('自动填充完成');
  }

  async autoSubmitForm() {
    // try { // 鉴于手动添加的时候自由度要高一点,就只在自动填表单的时候验证番号吧
    //   let isExist = await this.videoService.isSerialNumberExist(this.CrawlerData.serialNumber)
    //   if (!isExist) {
    //
    //   } else {
    //     this.msgSrv.error('番号已存在')
    //   }
    // } catch (e) {}
    if (!this.commonService.isAutoSubmit) { return; }
    await Promise.resolve().then(async () => { // 应对Error: NG0100,用setTimeout(() => {}, 0)也可以,相当于在第二次更新检测时再更新值,类似vue中的nextTick
      if (this.safeSF.valid) {
        try {
          await this.save(this.safeSF.value);
        } catch (e) {}
      } else {
        this.msgSrv.error('表单存在非法值,无法自动提交')
      }
    })
  }

}
