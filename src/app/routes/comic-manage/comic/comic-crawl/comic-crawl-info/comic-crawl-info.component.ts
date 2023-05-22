import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { fromEvent } from "rxjs";

import { VideoTagService } from '../../../../../service/video/video-tag.service';
import { VideoTypeService } from '../../../../../service/video/video-type.service';
import { VideoService } from '../../../../../service/video/video.service';
import { CommonService } from '../../../../../service/common/common.service';
import { CrawlService } from '../../../../../service/crawl/crawl.service';

import { dateStringFormatter } from "../../../../../shared/utils/dateUtils";

@Component({
  selector: 'app-comic-manage-comic-crawl-info',
  templateUrl: './comic-crawl-info.component.html',
  styleUrls: ['/comic-crawl-info.component.less']
})
export class ComicManageComicCrawlInfoComponent implements OnInit, OnDestroy {
  scoreTextList: string[] = this.commonService.scoreTextList;

  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      title: { type: 'string', title: '标题' },
      titleEng: { type: 'string', title: '英文标题' },
      score: { type: 'number', title: '评分', maximum: 10, multipleOf: 1 },
      comment: { type: 'string', title: '评论' },
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
    },
    required: ['title'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 145,
      grid: { span: 22 }
    },
    $title: { placeholder: '输入标题' },
    $titleEng: { placeholder: '输入英文标题' },
    $score: {
      // widget: 'custom'
      widget: 'rate',
      text: ` {{value}} 分`,
      tooltips: this.scoreTextList,
    },
    $comment: {
      widget: 'textarea'
    },
    $pageSize: {
      unit: '页',
      widgetWidth: 150,
      precision: 0
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
  };

  protected readonly dateStringFormatter = dateStringFormatter;
  crawlLoadingMsgId = ''
  coverSrc: string = ''
  javUrl: string = ''
  btdigUrl: string = ''
  nyaaUrl: string = ''
  dataSourceUrl: string = ''
  previewImageSrcList: string[] = [];
  enterKeyDownSubscription: any = null;
  spaceKeyDownSubscription: any = null;
  dKeyDownSubscription: any = null;

  constructor(
    private drawer: NzDrawerRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoTagService: VideoTagService,
    private videoTypeService: VideoTypeService,
    private videoService: VideoService,
    private commonService: CommonService,
    private crawlService: CrawlService,
    private nzModal: NzModalService
  ) {}

  async ngOnInit() {
    if (this.record.hasOwnProperty('crawlKey') && this.record.hasOwnProperty('crawlApiUrl')) {
      if (!(typeof this.record.crawlKey == 'string' && typeof this.record.crawlApiUrl == 'string' && this.record.crawlApiUrl != '')) { //直接在前端进行类型检查吧
        this.msgSrv.error('爬虫参数类型错误,请关闭页面');
        console.log(this.record)
        this.close();
        return;
      }
    } else {
      this.msgSrv.error('未正确配置爬虫参数,请关闭页面');
      this.close();
      return;
    }
    try {
      this.record.crawlKey = this.record.crawlKey.trim();
      this.crawlLoadingMsgId = this.msgSrv.loading(`${this.record.crawlKey}爬取中`, { nzDuration: 0 }).messageId;
      // switch (this.record.crawlType) {
      //   case 0:
      //     this.i = null; //js中空对象并不为假值,置假应该用null
      //     this.msgSrv.remove(this.crawlLoadingMsgId);
      //     this.msgSrv.error('未指定数据源,请关闭页面');
      //     return;
      //   case 1:
      //     this.i = (await this.crawlService.crawlJavBusVideo( { crawlKey: this.record.crawlKey, downloadImage: this.commonService.isDownloadImage })) || {};
      //     break;
      //   case 2:
      //     this.i = (await this.crawlService.crawlBrazzersVideo({ crawlKey: this.record.crawlKey, downloadImage: this.commonService.isDownloadImage })) || {};
      //     break;
      //   case 3:
      //     this.i = (await this.crawlService.crawlTransAngelsVideo({ crawlKey: this.record.crawlKey, downloadImage: this.commonService.isDownloadImage })) || {};
      //     break;
      //   default:
      //     this.i = null;
      //     this.msgSrv.remove(this.crawlLoadingMsgId);
      //     this.msgSrv.error('无法识别数据源,请关闭页面');
      //     return;
      // }
      this.i = (await this.crawlService.crawlVideoByUrl(this.record.crawlApiUrl,{ crawlKey: this.record.crawlKey, downloadImage: this.commonService.isDownloadImage })) || {};
      // this.i.serialNumber = this.record.serialNumber.toUpperCase(); //只接受处理完的符合网站链接标准的番号
      this.dataSourceUrl = this.i.dataSourceUrl
      this.coverSrc = this.i.coverSrc;
      this.javUrl = this.commonService.buildJavbusLink(this.i.crawlKey)
      this.btdigUrl = this.commonService.buildBtdiggLink(this.i.crawlKey)
      this.nyaaUrl = this.commonService.buildNyaaLink(this.i.crawlKey)
      this.previewImageSrcList = Array.isArray(this.i.localPreviewImageSrcList) ? this.i.localPreviewImageSrcList : []

      // this.enterKeyDownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(async event => {
      //   if (event.key == 'Enter') {
      //     try {
      //       this.save(this.sf.value);
      //     } catch (e) {}
      //   }
      // })
      // this.spaceKeyDownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
      //   if (event.key == ' ') {
      //     this.close();
      //   }
      // })
      // this.dKeyDownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
      //   if (event.key == 'd') {
      //     this.commonService.openNewTab(this.i.btdigUrl);
      //   }
      // })

      // this.msgSrv.remove(this.crawlLoadingMsgId);
      this.msgSrv.remove('');
      this.msgSrv.success('爬取成功');
    } catch (error) {
      console.error(error)
      // this.msgSrv.remove(this.crawlLoadingMsgId);
      this.msgSrv.remove('');
      this.msgSrv.error('爬取失败');
      this.close();
    }
  }

  async save(value: any) {
    if (this.record.id == 0) {  //只在新建的时候检验标题是否重复
      try {
        let isTitleExist: boolean = await this.videoService.isTitleExist(this.i.title);
        if (isTitleExist) {
          this.nzModal.confirm({
            nzTitle: '<i>此标题已存在</i>',
            nzContent: '<b>标题已存在,是否继续提交?</b>',
            nzCentered: true,
            nzOnOk: () => {
              this.drawer.close({ state: 'ok', data: value });
            }
          });
        } else {
          this.drawer.close({ state: 'ok', data: value });
        }
      } catch (error) {}
    } else {
      this.drawer.close({ state: 'ok', data: value });
    }
  }

  close(): void {
    this.drawer.close({ state: 'cancel', data: {} });
  }

  ngOnDestroy() {
    this.coverSrc = ''
    if (this.enterKeyDownSubscription) {
      this.enterKeyDownSubscription.unsubscribe();
    }
    if (this.spaceKeyDownSubscription) {
      this.spaceKeyDownSubscription.unsubscribe();
    }
    if (this.dKeyDownSubscription) {
      this.dKeyDownSubscription.unsubscribe();
    }
    this.msgSrv.remove('');
  }


}
