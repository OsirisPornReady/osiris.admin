import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import {fromEvent, Subscription} from "rxjs";

import { VideoTagService } from '../../../../../service/video/video-tag.service';
import { VideoTypeService } from '../../../../../service/video/video-type.service';
import { VideoService } from '../../../../../service/video/video.service';
import {VideoImageDownloadService} from '../../../../../service/video/video-image-download.service';
import { CommonService } from '../../../../../service/common/common.service';
import { CrawlService } from '../../../../../service/crawl/crawl.service';

import { dateStringFormatter } from "../../../../../shared/utils/dateUtils";
import {fallbackImageBase64} from "../../../../../../assets/image-base64";

@Component({
  selector: 'app-video-manage-video-crawl-info',
  templateUrl: './video-crawl-info.component.html',
  styleUrls: ['/video-crawl-info.component.less']
})
export class VideoManageVideoCrawlInfoComponent implements OnInit, OnDestroy {
  protected readonly fallbackImageBase64 = fallbackImageBase64;
  scoreTextList: string[] = this.commonService.scoreTextList;

  onSubmit: boolean = false;
  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      onStorage: { type: 'boolean', title: '入库情况' },
      score: { type: 'number', title: '评分', maximum: 10, multipleOf: 1 },
      comment: { type: 'string', title: '评价' },
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
      coverBase64: { type: 'string', title: '封面Base64' },
      previewImageSrcList: { type: 'string', title: '预览图' },
      localCoverSrc: { type: 'string', title: '本地封面' },
      localPreviewImageSrcList: { type: 'string', title: '本地预览图' },
      // imagePhysicalPath: { type: 'string', title: '图片物理根路径' },
      // imageServerPath: { type: 'string', title: '图片服务器根路径' },
      imagePhysicalDirectoryName: { type: 'string', title: '图片物理文件夹名路径' },
      imageServerDirectoryName: { type: 'string', title: '图片服务器文件夹名路径' },
      description: { type: 'string', title: '描述' }
    },
    required: ['title'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 145,
      grid: { span: 22 }
    },
    $onStorage: {
      checkedChildren: "已入库",
      unCheckedChildren: "未入库"
    },
    $score: {
      widget: 'rate',
      text: ` {{value}} 分 `,
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
  onStorage: boolean = false;

  keydownSubscription: Subscription = new Subscription();
  keyupSubscription: Subscription = new Subscription();
  ctrlPressed: boolean = true;

  coverBase64: string = ''
  previewImageBase64List: string[] = [];

  asyncCrawl: boolean = false;
  taskData: any = {};

  constructor(
    private drawer: NzDrawerRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoTagService: VideoTagService,
    private videoTypeService: VideoTypeService,
    private videoService: VideoService,
    private videoImageDownloadService: VideoImageDownloadService,
    private commonService: CommonService,
    private crawlService: CrawlService,
    private nzModal: NzModalService
  ) {}

  async ngOnInit() {
    if (this.asyncCrawl) {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          this.i = this.taskData || {};
          resolve(true);
        }, 500);
      })
    } else {
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
      if (this.commonService.globalData.isDownloadImage) {
        if (this.record.hasOwnProperty('imagePhysicalPath') && this.record.hasOwnProperty('imageServerPath') && this.record.hasOwnProperty('imagePhysicalDirectoryName') && this.record.hasOwnProperty('imageServerDirectoryName')) {
          this.record.imagePhysicalPath = (typeof this.record.imagePhysicalPath == 'string') ? this.record.imagePhysicalPath : ''
          this.record.imageServerPath = (typeof this.record.imageServerPath == 'string') ? this.record.imageServerPath : ''
          this.record.imagePhysicalDirectoryName = (typeof this.record.imagePhysicalDirectoryName == 'string') ? this.record.imagePhysicalDirectoryName : ''
          this.record.imageServerDirectoryName = (typeof this.record.imageServerDirectoryName == 'string') ? this.record.imageServerDirectoryName : ''
        } else {
          this.msgSrv.info('图片相关配置不正确,请关闭页面');
          this.close();
          return;
        }
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
        this.i = (await this.crawlService.crawlVideoByUrl(this.record.crawlApiUrl,{
          crawlKey: this.record.crawlKey,
          downloadImage: this.commonService.globalData.isDownloadImage,
          imagePhysicalPath: this.record.imagePhysicalPath,
          imageServerPath: this.record.imageServerPath,
          imagePhysicalDirectoryName: this.record.imagePhysicalDirectoryName,
          imageServerDirectoryName: this.record.imageServerDirectoryName
        })) || {};

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

    // this.i.serialNumber = this.record.serialNumber.toUpperCase(); //只接受处理完的符合网站链接标准的番号
    this.dataSourceUrl = this.i.dataSourceUrl
    // this.coverSrc = this.i.coverSrc;
    this.coverBase64 = this.i.coverBase64;
    this.javUrl = this.commonService.buildJavbusLink(this.i.crawlKey)
    this.btdigUrl = this.commonService.buildBtdiggLink(this.i.crawlKey)
    this.nyaaUrl = this.commonService.buildNyaaLink(this.i.crawlKey)
    // this.previewImageSrcList = Array.isArray(this.i.localPreviewImageSrcList) ? this.i.localPreviewImageSrcList : []
    this.previewImageBase64List = Array.isArray(this.i.previewImageBase64List) ? this.i.previewImageBase64List : []

    this.keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
      if (event.key == 'Control') {
        this.ctrlPressed = true;
      }
      if (this.ctrlPressed && event.key == 'Enter') {
        setTimeout(async () => {
          try {
            await this.save(this.sf.value);
          } catch (e) {}
        })
      }
    })
    this.keyupSubscription = fromEvent<KeyboardEvent>(document, 'keyup').subscribe(event => {
      if (event.key == 'Control') {
        this.ctrlPressed = false;
      }
    })

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
            nzOnOk: async () => {
              // let res = (await this.downloadVideoImage()) || {};
              // value.localCoverSrc = res?.localCoverSrc
              // value.localPreviewImageSrcList = res?.localPreviewImageSrcList
              // this.downloadVideoImage()
              this.onSubmit = true;
              this.drawer.close({ state: 'ok', data: value });
            }
          });
        } else {
          // let res = (await this.downloadVideoImage()) || {};
          // value.localCoverSrc = res?.localCoverSrc
          // value.localPreviewImageSrcList = res?.localPreviewImageSrcList
          // this.downloadVideoImage()
          this.onSubmit = true;
          this.drawer.close({ state: 'ok', data: value });
        }
      } catch (error) {}
    } else {
      // let res = (await this.downloadVideoImage()) || {};
      // value.localCoverSrc = res?.localCoverSrc
      // value.localPreviewImageSrcList = res?.localPreviewImageSrcList
      // this.downloadVideoImage();
      this.onSubmit = true;
      this.drawer.close({ state: 'ok', data: value });
    }
  }

  close(): void {
    this.drawer.close({ state: 'cancel', data: {} });
  }

  downloadVideoImage() {  // await
    // try {
    //   let entity = {
    //     imagePhysicalPath: this.i.imagePhysicalPath,
    //     imageServerPath: this.i.imageServerPath,
    //     imagePhysicalDirectoryName: this.i.imagePhysicalDirectoryName,
    //     imageServerDirectoryName: this.i.imageServerDirectoryName,
    //     coverSrc: this.i.coverSrc,
    //     localCoverSrc: this.i.localCoverSrc,
    //     previewImageSrcList: this.i.previewImageSrcList,
    //     localPreviewImageSrcList: this.i.localPreviewImageSrcList,
    //   }
    //   return await this.crawlService.downloadVideoImage(entity);
    // } catch (e) {
    //   this.msgSrv.error('下载预览图失败!')
    // }

    let entity: any = {
      imagePhysicalPath: this.i.imagePhysicalPath,
      imageServerPath: this.i.imageServerPath,
      imagePhysicalDirectoryName: this.i.imagePhysicalDirectoryName,
      imageServerDirectoryName: this.i.imageServerDirectoryName,
      coverSrc: this.i.coverSrc,
      localCoverSrc: this.i.localCoverSrc,
      previewImageSrcList: this.i.previewImageSrcList,
      localPreviewImageSrcList: this.i.localPreviewImageSrcList,
    }
    return this.crawlService.downloadVideoImage(entity).subscribe({
      next: async (res: any) => {
        try {
          await this.videoService.update({
            id: this.i.id,
            localCoverSrc: res?.localCoverSrc,
            localPreviewImageSrcList: res?.localPreviewImageSrcList
          });
          this.videoImageDownloadService.imageDownloadFinishSubject.next({ state: 'success' });
        } catch (e) {
          console.error(e)
        }
      },
      error: () => {
        this.msgSrv.error('下载预览图失败!')
      }
    });
  }

  ngOnDestroy() {
    this.coverSrc = ''
    // if (this.enterKeyDownSubscription) {
    //   this.enterKeyDownSubscription.unsubscribe();
    // }
    // if (this.spaceKeyDownSubscription) {
    //   this.spaceKeyDownSubscription.unsubscribe();
    // }
    // if (this.dKeyDownSubscription) {
    //   this.dKeyDownSubscription.unsubscribe();
    // }
    this.keydownSubscription.unsubscribe();
    this.keyupSubscription.unsubscribe();
    this.msgSrv.remove('');
  }

  switchOnStorage() {
    setTimeout(() => {
      this.sf.getProperty('/onStorage')?.setValue(this.onStorage, false);
    })
  }

}
