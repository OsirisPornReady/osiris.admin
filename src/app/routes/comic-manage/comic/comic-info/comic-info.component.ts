import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { fromEvent } from "rxjs";

import { ComicService } from '../../../../service/comic/comic.service';
import { CommonService } from '../../../../service/common/common.service';
import { CrawlService } from '../../../../service/crawl/crawl.service';

import { dateStringFormatter } from "../../../../shared/utils/dateUtils";

@Component({
  selector: 'app-comic-manage-comic-info',
  templateUrl: './comic-info.component.html',
  styleUrls: ['/comic-info.component.less']
})
export class ComicManageComicInfoComponent implements OnInit, OnDestroy {
  scoreTextList: string[] = this.commonService.scoreTextList;

  title = '';
  record: any = {};
  i: any;
  ei: any;
  @ViewChild('sf') sf!: SFComponent;
  @ViewChild('sf') evaluateSf!: SFComponent;
  schema: SFSchema = {
    properties: {
      title: { type: 'string', title: '标题' },
      titleJap: { type: 'string', title: '日文标题' },
      secureFileName: { type: 'string', title: '安全的文件名' },
      existSeed: { type: 'boolean', title: '是否有种子' },
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
      comicPhysicalPath: { type: 'string', title: '物理地址' },
      comicServerPath: { type: 'string', title: '服务器地址' },
      comicPhysicalDirectoryName: { type: 'string', title: '物理文件夹名' },
      comicServerDirectoryName: { type: 'string', title: '服务器文件夹名' },
      // coverSrc: { type: 'string', title: '封面' },
      // previewImageSrcList: { type: 'string', title: '预览图' },
      localCoverSrc: { type: 'string', title: '本地封面' },
      localPreviewImageSrcList: { type: 'string', title: '本地预览图' },
      comicPicLinkList: { type: 'string', title: '漫画链接' },
      comicFailOrderList: { type: 'string', title: '缺失图片序号(从1开始)' },
      localComicPicSrcList: { type: 'string', title: '本地漫画链接' },
    },
    required: ['title'],
  };
  evaluateSchema: SFSchema = {
    properties: {
      score: { type: 'number', title: '评分', maximum: 10, multipleOf: 1 },
      comment: { type: 'string', title: '评价' },
    },
    required: [],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 145,
      grid: { span: 22 }
    },
    $title: { placeholder: '输入标题' },
    $titleJap: { placeholder: '输入日文标题' },
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

  protected readonly dateStringFormatter = dateStringFormatter;
  coverSrc: string = ''
  javUrl: string = ''
  btdigUrl: string = ''
  nyaaUrl: string = ''
  dataSourceUrl: string = ''
  previewImageSrcList: string[] = [];
  enterKeyDownSubscription: any = null;
  spaceKeyDownSubscription: any = null;
  dKeyDownSubscription: any = null;
  score: number = 0;
  comment: string = '';

  constructor(
    private drawer: NzDrawerRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private comicService: ComicService,
    private commonService: CommonService,
    private crawlService: CrawlService
  ) {}

  async ngOnInit() {
    try {
      let res = (await this.comicService.getById(this.record.id)) || {}
      this.i = res
      this.ei = {
        id: res?.id,
        score: res?.score,
        comment: res?.comment
      }

      this.dataSourceUrl = this.i.dataSourceUrl

      this.javUrl = this.commonService.buildJavbusLink(this.i.crawlKey)
      this.btdigUrl = this.commonService.buildBtdiggLink(this.i.crawlKey)
      this.nyaaUrl = this.commonService.buildNyaaLink(this.i.crawlKey)
      this.previewImageSrcList = Array.isArray(this.i.localComicPicSrcList) ? this.i.localComicPicSrcList : []


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

    } catch (error) {
      console.error(error)
      this.msgSrv.error('读取信息失败')
      this.close();
    }
  }

  async evaluate(value: any) {
    try {
      await this.comicService.update(value);
      this.msgSrv.success('评分评价保存成功');
    } catch (error) {}
  }

  async save(value: any) {
    try {
      this.drawer.close({ state: 'ok', data: value });
    } catch (error) {}
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
  }


}
