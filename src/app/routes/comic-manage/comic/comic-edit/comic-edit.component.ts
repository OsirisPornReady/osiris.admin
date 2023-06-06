import {Component, OnInit, AfterViewInit, ViewChild, QueryList, ViewChildren, ChangeDetectorRef} from '@angular/core';
import {SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient, DrawerHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AreaService } from '../../../../service/area/area.service';
import { CastService } from '../../../../service/cast/cast.service';
import { CommonService } from '../../../../service/common/common.service';
import { CrawlTypeService } from '../../../../service/crawl/crawl-type.service';
import { ComicService } from "../../../../service/comic/comic.service";

import { ComicManageComicCrawlInfoComponent } from '../comic-crawl/comic-crawl-info/comic-crawl-info.component';

@Component({
  selector: 'app-comic-manage-comic-edit',
  templateUrl: './comic-edit.component.html'
})
export class ComicManageComicEditComponent implements OnInit, AfterViewInit {
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
      onlyCrawlInfo: { type: 'boolean', title: '只导入信息' },
      crawlApiUrl: { type: 'string', title: '导入数据源' },
      crawlKey: { type: 'string', title: '导入关键字' },
      comicPhysicalPath: { type: 'string', title: '物理地址' },
      comicServerPath: { type: 'string', title: '服务器地址' },
      comicPhysicalDirectoryName: { type: 'string', title: '物理文件夹名' },
      comicServerDirectoryName: { type: 'string', title: '服务器文件夹名' },
      crawlButton: { type: 'string', title: '导入' },
      title: { type: 'string', title: '标题' },
      titleJap: { type: 'string', title: '日文标题' },
      secureFileName: { type: 'string', title: '安全的文件名' },
      existSeed: { type: 'boolean', title: '是否有种子' },
      score: { type: 'number', title: '评分', maximum: 10, multipleOf: 1 },
      pageSize: { type: 'number', title: '页数' },
      languageTags: { type: 'string', title: '语言' },
      parodyTags: { type: 'string', title: '同人原作' },
      characterTags: { type: 'string', title: '角色' },
      groupTags: { type: 'string', title: '创作团体' },
      artistTags: { type: 'string', title: '创作者' },
      maleTags: { type: 'string', title: '男性标签' },
      femaleTags: { type: 'string', title: '女性标签' },
      mixedTags: { type: 'string', title: '混合标签' },
      otherTags: { type: 'string', title: '其他标签' },
      onStorage: { type: 'boolean', title: '入库情况' },
      comicSrc: { type: 'string', title: '本地地址' },
      comicResolution: { type: 'string', title: '漫画分辨率' },
      postedTime: { type: 'string', title: '发行日期', format: 'date-time' },
      comicType: { type: 'string', title: '类型' },
      inSeries: { type: 'boolean', title: '是否系列作品' },
      series: { type: 'string', title: '系列' },
      // area: { type: 'string', title: '地区' },
      // addTime: { type: 'string', title: '添加时间', format: 'date-time' },
      description: { type: 'string', title: '描述' },
      // coverSrc: { type: 'string', title: '封面' },
      // previewImageSrcList: { type: 'string', title: '预览图' },
      coverBase64: { type: 'string', title: '封面Base64' },
      // localCoverSrc: { type: 'string', title: '本地封面' },
      // localPreviewImageSrcList: { type: 'string', title: '本地预览图' },
      comicPicLinkList: { type: 'string', title: '漫画链接' },
      comicFailOrderList: { type: 'string', title: '缺失图片序号(从1开始)' },
      localComicPicSrcList: { type: 'string', title: '本地漫画链接' },
      dataSourceUrl: { type: 'string', title: '数据源' },
      comment: { type: 'string', title: '评论' },
    },
    required: ['title', 'pageSize']
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 120,
      grid: { span: 22 }
    },
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
    $title: { placeholder: '输入标题' },
    $titleJap: { placeholder: '输入日文标题' },
    $score: {
      // widget: 'custom'
      widget: 'rate',
      text: ` {{value}} 分`,
      tooltips: this.scoreTextList,
    },
    $pageSize: {
      unit: '页',
      widgetWidth: 150,
      precision: 0,
      changeDebounceTime: 500,
      change: (val: number) => { //getProperty setValue还是不能用在复杂类型上,最好还是setValue
        if (this.record.id == 0 && !this.automated) {
          try {
            this.sf.setValue('/localComicPicSrcList', (new Array(val)).fill('-'));
            this.sf.setValue('/comicFailOrderList', Array.from(new Array(val + 1).keys()).slice(1));
          } catch (e) {
            console.error(e)
          }
        }
      },
    },
    $languageTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加语言',
      mode: 'tags',
      default: null,
    },
    $parodyTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加同人原作',
      mode: 'tags',
      default: null,
    },
    $characterTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加角色',
      mode: 'tags',
      default: null,
    },
    $groupTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加创作团体',
      mode: 'tags',
      default: null,
    },
    $artistTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加创作者',
      mode: 'tags',
      default: null,
    },
    $maleTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加男性标签',
      mode: 'tags',
      default: null,
    },
    $femaleTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加女性标签',
      mode: 'tags',
      default: null,
    },
    $mixedTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加混合标签',
      mode: 'tags',
      default: null,
    },
    $otherTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加其他标签',
      mode: 'tags',
      default: null,
    },
    $onStorage: {
      checkedChildren: '已入库',
      unCheckedChildren: '未入库'
    },
    $comicSrc: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入漫画地址(可多个值)',
      mode: 'tags',
      default: null,
    },
    $comicResolution: {},
    $postedTime: {
      widget: 'date'
    },
    $comicType: {},
    $series: {
      visibleIf: {
        inSeries: val => val
      },
      widget: 'select',
      allowClear: true,
      placeholder: '请添加系列',
      mode: 'tags',
      default: null,
    },
    $isClassified: {
      checkedChildren: '已分类',
      unCheckedChildren: '未分类',
    },
    $description: {
      widget: 'textarea',
      autosize: { minRows: 3, maxRows: 6 }
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
    $comicPicLinkList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入图(可多个值)',
      mode: 'tags',
      default: null,
    },
    $comicFailOrderList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入图(可多个值)',
      mode: 'tags',
      default: null,
    },
    $localComicPicSrcList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入图(可多个值)',
      mode: 'tags',
      default: null,
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
    private comicService: ComicService,
    private drawer: DrawerHelper,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改';
      try {
        this.i = (await this.comicService.getById(this.record.id)) || {};
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
    try {
      if (this.record.id > 0) {
        await this.comicService.update(value);
      } else {
        await this.comicService.add(value);
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
      this.drawer.create('爬取信息', ComicManageComicCrawlInfoComponent, { record: value }, { size: 1600, drawerOptions: { nzClosable: false } }).subscribe(async res => {
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

    // settimeout可以,promise比settimeout快总之别连续访问值(特别是在改变值之后)
    // https://www.google.com/search?q=promise.resolve.then+vs+settimeout&sxsrf=APwXEdfY7MK32DIt_p73CWi0-mfIo98qqw%3A1684781684066&source=hp&ei=dLprZPKwAtnmhwOfkbmADw&iflsig=AOEireoAAAAAZGvIhDdJUWUx4nNIEvSWoqYUJHN162ow&oq=Promise.resolve%28%29.then+set&gs_lcp=Cgdnd3Mtd2l6EAMYADIGCAAQCBAeOgUIABCiBDoFCCEQoAE6BQgAEIAEOgQIABAeOgUIABDLAVAAWL1LYKNUaAJwAHgAgAGGAYgB1wmSAQQxMC4zmAEAoAECoAEB&sclient=gws-wiz
    // setTimeout(async () => {
    //   await this.autoSubmitForm();
    // })
    //
    // setTimeout(async () => {
    //   await this.autoSubmitForm();
    // }, 0)

    // 这个居然不好使了, 奇怪
    // await Promise.resolve().then(async () => { // 应对Error: NG0100,用setTimeout(() => {}, 0)也可以,相当于在第二次更新检测时再更新值,类似vue中的nextTick
    //
    // })

    setTimeout(async () => {
      await this.autoSubmitForm();
    })
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
    // if (this.safeSF.valid) {
    if (this.sf.valid) {
      try {
        await this.save(this.sf.value);
      } catch (e) {}
    } else {
      this.msgSrv.error('表单存在非法值,无法自动提交')
    }
  }

}
