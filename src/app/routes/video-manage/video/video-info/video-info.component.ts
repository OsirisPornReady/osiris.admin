import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { fromEvent } from "rxjs";

import { VideoTagService } from '../../../../service/video/video-tag.service';
import { VideoTypeService } from '../../../../service/video/video-type.service';
import { VideoService } from '../../../../service/video/video.service';
import { CommonService } from '../../../../service/common/common.service';
import { CrawlService } from '../../../../service/crawl/crawl.service';

import { dateStringFormatter } from "../../../../shared/utils/dateUtils";

@Component({
  selector: 'app-video-manage-video-info',
  templateUrl: './video-info.component.html',
  styleUrls: ['/video-info.component.less']
})
export class VideoManageVideoInfoComponent implements OnInit, OnDestroy {
  scoreTextList: string[] = this.commonService.scoreTextList;

  title = '';
  record: any = {};
  i: any;
  ei: any;
  @ViewChild('sf') sf!: SFComponent;
  @ViewChild('sf') evaluateSf!: SFComponent;
  schema: SFSchema = {
    properties: {
      // score: { type: 'number', title: '评分', maximum: 10, multipleOf: 1 },
      // comment: { type: 'string', title: '评价' },
      serialNumber: { type: 'string', title: '番号' },
      title: { type:'string', title: '标题' },
      videoType: { type: 'string', title: '类型' },
      videoSrc: { type: 'string', title: '视频地址' },
      publishTime: { type:'string', title: '发布时间', format: 'date' },
      duration: { type:'number', title: '时长' },
      director: { type:'string', title: '导演' },
      producer: { type:'string', title: '制作商' },
      releaser: { type:'string', title: '发行商' },
      brand: { type: 'string', title: '厂牌' },
      series: { type:'string', title: '系列' },
      starsRaw: { type: 'string', title: '演员' },
      tagsRaw: { type: 'string', title: '标签' },
      coverSrc: { type: 'string', title: '封面' },
      previewImageSrcList: { type: 'string', title: '预览图' },
      localCoverSrc: { type: 'string', title: '本地封面' },
      localPreviewImageSrcList: { type: 'string', title: '本地预览图' },
      description: { type: 'string', title: '描述' }
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
    $score: {
      widget: 'rate',
      text: ` {{value}} 分`,
      tooltips: this.scoreTextList,
    },
    $comment: {
      widget: 'textarea'
    },
    $serialNumber: {
      widget: 'text',
      defaultText: '-',
      html: true
    },
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
      widget: 'select',
      allowClear: true,
      placeholder: '请选择系列',
      mode: 'tags',
      default: null,
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
    $videoSrc: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入视频地址(可多个值)',
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
    private videoTagService: VideoTagService,
    private videoTypeService: VideoTypeService,
    private videoService: VideoService,
    private commonService: CommonService,
    private crawlService: CrawlService
  ) {}

  async ngOnInit() {
    try {
      let res = (await this.videoService.getById(this.record.id)) || {}
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
      this.previewImageSrcList = Array.isArray(this.i.localPreviewImageSrcList) ? this.i.localPreviewImageSrcList : []


      this.spaceKeyDownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
        if (event.key == ' ') {
          this.close();
        }
      })
      this.dKeyDownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
        if (event.key == 'd') {
          this.commonService.openNewTab(this.i.btdigUrl);
        }
      })

    } catch (error) {
      console.error(error)
      this.msgSrv.error('读取信息失败')
      this.close();
    }
  }

  async evaluate(value: any) {
    try {
      await this.videoService.update(value);
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
