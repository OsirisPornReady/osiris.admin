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
import { VideoImageDownloadService } from '../../../../service/video/video-image-download.service';

import { VideoManageVideoCrawlInfoComponent } from '../video-crawl/video-crawl-info/video-crawl-info.component';

@Component({
  selector: 'app-video-manage-video-edit',
  templateUrl: './video-edit.component.html'
})
export class VideoManageVideoEditComponent implements OnInit, AfterViewInit {
  scoreTextList: string[] = this.commonService.scoreTextList;

  title = '';
  record: any = {};
  i: any;
  @ViewChildren(SFComponent) sfList!: QueryList<SFComponent>;
  @ViewChild('sf') sf!: SFComponent;
  safeSF!: SFComponent;
  schema: SFSchema = {
    properties: {
      canCrawl: { type: 'boolean', title: '是否需要导入' },
      // crawlType: { type: 'string', title: '导入数据源' },
      crawlApiUrl: { type: 'string', title: '导入数据源' },
      crawlKey: { type: 'string', title: '导入关键字' },
      imagePhysicalPath: { type: 'string', title: '图片物理根路径' },
      imageServerPath: { type: 'string', title: '图片服务器根路径' },
      imagePhysicalDirectoryName: { type: 'string', title: '图片物理文件夹名路径' },
      imageServerDirectoryName: { type: 'string', title: '图片服务器文件夹名路径' },
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
      description: { type: 'string', title: '描述' },
      coverSrc: { type: 'string', title: '封面' },
      coverBase64: { type: 'string', title: '封面Base64' },
      previewImageSrcList: { type: 'string', title: '预览图' },
      localCoverSrc: { type: 'string', title: '本地封面' },
      localPreviewImageSrcList: { type: 'string', title: '本地预览图' },
      dataSourceUrl: { type: 'string', title: '数据源' },
      btdigUrl: { type: 'string', title: 'btdig' },
      comment: { type: 'string', title: '评论' },
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
    // $crawlType: {
    //   visibleIf: {
    //     canCrawl: val => val
    //   },
    //   widget: 'select',
    //   allowClear: true,
    //   placeholder: '请选择导入数据源',
    //   width: 400,
    //   asyncData: () => this.crawlTypeService.getSelectAll()
    // },
    $crawlApiUrl: {
      visibleIf: {
        canCrawl: val => val
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请选择导入数据源',
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
      text: ` {{value}} 分`,
      tooltips: this.scoreTextList,
    },
    $previewImageSrcList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入预览图(可多个值)',
      mode: 'tags',
      default: null,
    },
    $localPreviewImageSrcList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入本地预览图(可多个值)',
      mode: 'tags',
      default: null,
    },
    $comment: {
      widget: 'textarea'
    },
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
    private videoImageDownloadService: VideoImageDownloadService,
    private drawer: DrawerHelper,
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改';
      try {
        this.i = (await this.videoService.getById(this.record.id)) || {};
      } catch (e) {
        console.error(e)
        this.msgSrv.error('请求失败')
      }
    } else {
      this.title = '新增';
      this.i = {};
    }
    setTimeout(async () => {
      if (this.automated) {
        await this.automatedOperate();
      }
    })
  }

  ngAfterViewInit() {
    //2023-5-18更新: 好像直接用this.sf?.getProperty().setValue() 或者直接 this.sf?.setValue() 就行了
    //2023-5-18更新: 上述方法还是不行
    //2023-5-18更新: this.safeSF.getProperty(`/${key}`)?.setValue(fillData[key], true); 会填不了tag类型的select,弃用
    //2023-5-21更新: 搞清楚了this.safeSF.getProperty(`/${key}`)?.setValue(fillData[key], false); 中的onlySelf字段会影响填写相关的行为,设置为false才能有效更新表单值
    //2023-5-22更新: 要获得sf就得设置{ static: false },当然viewchild不传参数也可以的，因为默认参数就是 static false
    //2023-5-23更新: 在setTimeout中执行是更好的方法

    //由于sf组件没有足够的钩子,只能出此下策
    // if (this.record.id > 0) {
    //   this.sfList.changes.subscribe(() => {
    //     let sfArray = this.sfList.toArray();
    //     if (sfArray.length > 0) {
    //       this.safeSF = sfArray[0];
    //       // promise语法糖,相当于
    //       // new Promise((resolve) => {
    //       //   resolve(42)
    //       // })
    //       Promise.resolve().then(async () => { // 应对Error: NG0100,用setTimeout(() => {}, 0)也可以,相当于在第二次更新检测时再更新值,类似vue中的nextTick
    //         if (this.automated) {
    //           await this.automatedOperate();
    //         }
    //       })
    //     }
    //   })
    // } else {
    //   this.safeSF = this.sf
    //   // this.safeSF.validator()
    //   Promise.resolve().then(async () => { // 应对Error: NG0100,用setTimeout(() => {}, 0)也可以,相当于在第二次更新检测时再更新值,类似vue中的nextTick
    //     if (this.automated) {
    //       await this.automatedOperate();
    //     }
    //   })
    // }
  }

  async save(value: any) {
    // const params = { ...value };
    // params.id = this.record.id;
    // sf的机制让它不会收集为null的数据,不符合后端VideoDTO,提交params会出错
    let id: number = -1;
    try {
      if (this.record.id > 0) {
        id = await this.videoService.update(value);
      } else {
        id = await this.videoService.add(value);
      }
      let item: any = {
        id,
        ...value
      }
      if (this.automated) {
        this.videoImageDownloadService.downloadVideoImage(item);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

  crawlInfo(value: any) {
    if (value.hasOwnProperty('crawlApiUrl') && value.hasOwnProperty('crawlKey')) {
      if (this.commonService.globalData.isDownloadImage) {
        if (!(value.hasOwnProperty('imagePhysicalPath') && value.hasOwnProperty('imageServerPath') && value.hasOwnProperty('imagePhysicalDirectoryName') && value.hasOwnProperty('imageServerDirectoryName'))){
          this.msgSrv.info('如果要下载图片,请配置图片相关的文件地址');
          return;
        }
      }
      this.drawer.static('爬取信息', VideoManageVideoCrawlInfoComponent, { record: value }, { size: 1600, drawerOptions: { nzClosable: false } }).subscribe(async res => {
        if (res.state == 'ok') {
          this.automatedData = res.data;
          this.automated = true;
          await this.automatedOperate();
        }
      });
    } else {
      this.msgSrv.info('请配置爬虫数据源与爬虫关键字');
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
    // if (!this.commonService.isAutoFill) { return; }
    if (!this.commonService.globalData.isAutoFill) { return; }
    this.automatedMsgId = this.msgSrv.loading(`表单自动填充中`, { nzDuration: 0 }).messageId;
    let { ...fillData } = this.automatedData;
    Object.keys(fillData).forEach((key: string) => {
      if (this.record.id > 0) {
        if (key == 'score' && fillData[key] == null) { return; }
        if (key == 'comment' && fillData[key] == null) { return; }
      }

      try {
        // this.safeSF.setValue(`/${key}`, fillData[key]);

        //https://github.com/ng-alain/ng-alain/issues/1146
        //Property.setValue 只会更新某个元素值并校验并不会跟UI产生联系，若想变更值建议使用 sf.setValue （可能会遇到 #1171 无法更新问题）。

        // this.sf.getProperty(`/${key}`)?.setValue(fillData[key], false); //解决了时机问题就只需要让onlySelf项为false就行了
        this.sf.setValue(`/${key}`, fillData[key]);
      } catch (e) {
        console.error(`自动填充字段${key}失败`, e);
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
    // if (!this.commonService.isAutoSubmit) { return; }
    if (!this.commonService.globalData.isAutoSubmit) { return; }
    // await Promise.resolve().then(async () => { // 应对Error: NG0100,用setTimeout(() => {}, 0)也可以,相当于在第二次更新检测时再更新值,类似vue中的nextTick
    //   if (this.safeSF.valid) {
    //     try {
    //       await this.save(this.safeSF.value);
    //     } catch (e) {}
    //   } else {
    //     this.msgSrv.error('表单存在非法值,无法自动提交')
    //   }
    // })
    if (this.sf.valid) {
      try {
        await this.save(this.sf.value);
      } catch (e) {}
    } else {
      this.msgSrv.error('表单存在非法值,无法自动提交')
    }
  }

}
