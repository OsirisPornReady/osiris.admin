import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {STColumn, STComponent} from '@delon/abc/st';
import {SFSchema} from '@delon/form';
import {_HttpClient, DrawerHelper, ModalHelper} from '@delon/theme';
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from 'ng-zorro-antd/notification';

import { VideoService } from '../../../service/video/video.service';
import { VideoImageDownloadService } from '../../../service/video/video-image-download.service';
import { CommonService } from '../../../service/common/common.service';
import { DataUrlDetectService } from '../../../service/common/dataUrl.detect.service';
import { CrawlService } from '../../../service/crawl/crawl.service';
import { CrawlTypeService } from '../../../service/crawl/crawl-type.service';
import { CrawlTaskService } from '../../../service/crawl/crawl-task.service';

import { VideoManageVideoEditComponent } from '../../video-manage/video/video-edit/video-edit.component';
import { VideoManageVideoCrawlInfoComponent } from '../../video-manage/video/video-crawl/video-crawl-info/video-crawl-info.component';
import { VideoManageVideoInfoComponent } from '../../video-manage/video/video-info/video-info.component';
import { VideoManageVideoCrawlConfigComponent } from '../../video-manage/video/video-crawl/video-crawl-config/video-crawl-config.component';
import { GalleryTorrentListComponent} from '../torrent-list/torrent-list.component';
import { GalleryPlayVideoListComponent } from '../play-video-list/play-video-list.component';

import {finalize, fromEvent, lastValueFrom, Subscription} from "rxjs";
import {dateStringFormatter} from "../../../shared/utils/dateUtils";
import {CrawlMessage} from "../../../model/CrawlMessage";
import {VideoCrawlTask} from "../../../model/CrawlTask";
import {fallbackImageBase64} from "../../../../assets/image-base64";
import {VideoManageLocalVideoEditComponent} from "../../video-manage/video/local-video-edit/local-video-edit.component";
import {
  VideoManageVideoCustomTagsEditComponent
} from "../../video-manage/video/video-custom-tags-edit/video-custom-tags-edit.component";
import {
  VideoManageVideoCustomSortOrderEditComponent
} from "../../video-manage/video/video-custom-order-edit/video-custom-sort-order-edit.component";


@Component({
  selector: 'app-gallery-video-gallery',
  templateUrl: './video-gallery.component.html',
  styleUrls: ['./video-gallery.component.less']
})
export class GalleryVideoGalleryComponent implements OnInit, OnDestroy {
  protected readonly fallbackImageBase64 = fallbackImageBase64;

  url = `/user`;
  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号'
      }
    }
  };
  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '编号', index: 'no' },
    { title: '调用次数', type: 'number', index: 'callNo' },
    { title: '头像', type: 'img', width: '50px', index: 'avatar' },
    { title: '时间', type: 'date', index: 'updatedAt' },
    {
      title: '',
      buttons: [
        // { text: '查看', click: (item: any) => `/form/${item.id}` },
        // { text: '编辑', type: 'static', component: FormEditComponent, click: 'reload' },
      ]
    }
  ];

  pi: number = 1;
  ps: number = 8;
  total: number = 0;
  psOptions: number[] = [8, 12, 16]
  gridList: any[] = []
  loading: boolean = false;

  crawlKey: string = '';
  crawlTypeOptions: any[] = [];
  crawlApiUrl: any = null;
  imagePhysicalPath: string = '';
  imageServerPath: string = '';
  imagePhysicalDirectoryName: string = '';
  imageServerDirectoryName: string = '';

  showEdit: boolean = false;
  keyword: string = '';

  savedPi: any = null;

  messageSocketSubscription: Subscription = new Subscription();
  reloadSocketSpin: boolean = false;

  imageDownloadFinishSubscription: Subscription = new Subscription();

  torrentList: any[] = []
  popoverVisibleList: boolean[] = []

  videoIdListOwnLocal: number[] = [];

  keydownSubscription: Subscription = new Subscription();
  keyupSubscription: Subscription = new Subscription();
  ctrlPressed: boolean = false;

  switchLoading: boolean = false;

  fileDialogSubscription: Subscription = new Subscription();
  onOpenDialog: boolean = false;

  realTimeCrawl: boolean = false;
  // crawlTaskCount: number = 0;

  canSwitchVideoOnClient: boolean = false;
  videoIdListOnClient: number[] = [];
  switchOnClientLoading: boolean = false;
  videoIdOnSwitchingOnClient: number = -1;

  sort: string = '';
  sortOptions = [
    { label: '发布时间排序', value: 'publishTime.descend' },
    { label: '添加时间排序', value: 'addTime.descend' },
    { label: '更新时间排序', value: 'updateTime.descend' },
    { label: '自定义排序', value: 'customSortOrder.descend' },
  ];

  swapIdStack: number[] = [];
  onSwapCustomSortOrder: boolean = true;


  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private videoService: VideoService,
    private videoImageDownloadService: VideoImageDownloadService,
    private commonService: CommonService,
    private dataUrlDetectService: DataUrlDetectService,
    private crawlService: CrawlService,
    private crawlTypeService: CrawlTypeService,
    public crawlTaskService: CrawlTaskService,
    private drawer: DrawerHelper,
    private msgSrv: NzMessageService,
    private ntfService: NzNotificationService,
    private domSanitizer: DomSanitizer
  ) { }

  protected readonly dateStringFormatter = dateStringFormatter;

  async ngOnInit() {
    try {
      this.videoIdListOwnLocal = (await this.videoService.getVideoIdListOwnLocal()) || [];
      this.videoIdListOnClient = (await this.videoService.getVideoIdListOnClient()) || [];
    } catch (e) {
      console.error(e);
    }
    // this.crawlTaskCount = this.crawlTaskService.videoCrawlTaskList.length;
    this.getByPage();
    this.crawlTypeOptions = (await lastValueFrom(this.crawlTypeService.getSelectAll())) || [];
    this.crawlApiUrl = this.crawlTypeOptions.length > 0 ? this.crawlTypeOptions[1].value : null;
    this.imagePhysicalPath = this.commonService.globalData.imagePhysicalPath
    this.imageServerPath = this.commonService.globalData.imageServerPath
    this.imagePhysicalDirectoryName = this.commonService.globalData.imagePhysicalDirectoryName
    this.imageServerDirectoryName = this.commonService.globalData.imageServerDirectoryName
    this.imageDownloadFinishSubscription = this.videoImageDownloadService.imageDownloadFinishSubject.subscribe(async (res: any) => {
      if (res.state == 'success') {
        // this.getByPage();
      }
    })
    this.keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
      if (event.key == 'Control') {
        this.ctrlPressed = true;
      }
      if (this.ctrlPressed && event.key == '.') {
        navigator.clipboard.readText().then(clipText => {
          if (clipText) {
            this.crawlKey = clipText;
            let dataUrlType = this.dataUrlDetectService.detectUrlType(clipText);
            if (dataUrlType) {
              this.crawlApiUrl = dataUrlType;
            }
            this.autoCreate();
          }
        });
      }
      if (this.ctrlPressed && event.key == ' ') {
        if (this.crawlTaskService.onVideoWorkFlow) {
          this.msgSrv.warning('爬取工作流未完成，无法添加任务');
          return;
        }
        navigator.clipboard.readText().then(clipText => {
          if (clipText) {
            this.crawlKey = clipText;
            let dataUrlType = this.dataUrlDetectService.detectUrlType(clipText);
            if (dataUrlType) {
              this.crawlApiUrl = dataUrlType;
            }
            this.autoTask();
          }
        });
      }
    })
    this.keyupSubscription = fromEvent<KeyboardEvent>(document, 'keyup').subscribe(event => {
      if (event.key == 'Control') {
        this.ctrlPressed = false;
      }
    })
    this.commonService.createWebSocketSubject('crawlMessageSocketUrl');
    this.connectMessageSocket();
  }

  ngOnDestroy() {
    this.keydownSubscription.unsubscribe();
    this.keyupSubscription.unsubscribe();
    this.imageDownloadFinishSubscription.unsubscribe();
    this.messageSocketSubscription.unsubscribe();
  }

  add(): void {
    // this.modal
    //   .createStatic(FormEditComponent, { i: { id: 0 } })
    //   .subscribe(() => this.st.reload());
  }

  getByPage() {
    let url = `api/video/get_by_page?pi=${this.pi}&ps=${this.ps}`
    if (this.keyword) {
      url = `${url}&keyword=${this.keyword}`;
    }
    if (this.sort) {
      url = `${url}&sort=${this.sort}`;
    }
    this.loading = true;
    this.http.get(url).pipe(finalize(() => {
      this.loading = false;
    })).subscribe((res: any) => {
      this.total = res.total;
      this.gridList = res.list;
      this.popoverVisibleList = new Array(this.gridList.length).fill(false);
    })
  }

  handlePageIndexChange() {
    this.getByPage();
  }

  handlePageSizeChange() {
    this.getByPage();
  }

  handlePreview(event: any) {
    event.stopPropagation();
  }

  handleLink(event: any) {
    event.stopPropagation();
  }

  openInfo(id: number) {
    this.drawer.create('', VideoManageVideoInfoComponent, {record: {id}}, {
      size: 1600,
      footer: false,
      drawerOptions: {nzPlacement: 'left', nzClosable: false}
    }).subscribe(res => {
      if (res.state == 'ok') {

      }
    });
  }

  setConfig(id: number, event: any) {
    event.stopPropagation();
    this.modal.createStatic(VideoManageVideoCrawlConfigComponent, {record: {id}}).subscribe(res => {
      if (res.state == 'updateOk') {
        this.getByPage();
      }
    });
  }

  getCrawl(item: any) {
    let value = {
      id: item.id,
      crawlApiUrl: item.crawlApiUrl,
      crawlKey: item.crawlKey,
      imagePhysicalPath: item.imagePhysicalPath,
      imageServerPath: item.imageServerPath,
      imagePhysicalDirectoryName: item.imagePhysicalDirectoryName,
      imageServerDirectoryName: item.imageServerDirectoryName,
    }
    if (value.hasOwnProperty('crawlApiUrl') && value.hasOwnProperty('crawlKey')) {
      this.drawer.static('爬取信息', VideoManageVideoCrawlInfoComponent, {record: value}, {
        size: 1600,
        drawerOptions: {nzClosable: false}
      }).subscribe(res => {
        if (res.state == 'ok') {
          this.modal.createStatic(VideoManageVideoEditComponent, {
            record: {id: value.id},
            automated: true,
            automatedData: res.data
          }).subscribe(res => {
            if (res == 'ok') {
              this.getByPage();
            }
          });
        }
      });
    } else {
      this.msgSrv.info('请配置爬虫数据源与爬虫关键字');
    }
  }

  autoCreate() {
    if (!this.crawlApiUrl) {
      this.msgSrv.info('爬虫类型未设置');
    } else if (!this.crawlKey.trim()) { //涉及输入框的要做trim处理
      this.msgSrv.info('爬虫关键字为空');
    } else {
      let value = {
        id: 0,
        crawlApiUrl: this.crawlApiUrl,
        crawlKey: this.crawlKey,
        imagePhysicalPath: this.imagePhysicalPath,
        imageServerPath: this.imageServerPath,
        imagePhysicalDirectoryName: this.imagePhysicalDirectoryName,
        imageServerDirectoryName: this.imageServerDirectoryName,
      }
      this.getCrawl(value);
    }
  }

  autoTask() {
    if (!this.crawlApiUrl) {
      this.msgSrv.info('爬虫类型未设置');
    } else if (!this.crawlKey.trim()) { //涉及输入框的要做trim处理
      this.msgSrv.info('爬虫关键字为空');
    } else {
      let value = {
        id: 0,
        crawlApiUrl: this.crawlApiUrl,
        crawlKey: this.crawlKey,
        imagePhysicalPath: this.imagePhysicalPath,
        imageServerPath: this.imageServerPath,
        imagePhysicalDirectoryName: this.imagePhysicalDirectoryName,
        imageServerDirectoryName: this.imageServerDirectoryName,
      }
      this.createVideoCrawlTask(value);
    }
  }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoEditComponent, {record: {id}}).subscribe(res => {
      if (res == 'ok') {
        this.getByPage();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.videoService.delete(id);
      this.msgSrv.success('删除成功');
      this.getByPage();
    } catch (e) {
      console.error(e);
    }
  }

  async deleteVideoLocalImage(item: any) {
    try {
      await this.videoService.deleteVideoLocalImage(item);
      this.msgSrv.success('本地图片删除成功');
    } catch (e) {
      console.error(e);
    }
  }

  resetCrawlKey() {
    this.crawlKey = '';
  }

  search() {
    if (this.savedPi == null) {
      this.savedPi = this.pi;
    }
    this.pi = 1;
    this.getByPage();
  }

  resetSearch() {
    this.keyword = '';
    if (this.savedPi == null) {
      this.pi = 1;
    } else {
      this.pi = this.savedPi;
      this.savedPi = null;
    }
    this.getByPage();
  }

  connectMessageSocket() {
    this.reloadSocketSpin = true;
    if (!this.messageSocketSubscription.closed) {
      this.messageSocketSubscription.unsubscribe();
    }
    this.messageSocketSubscription = this.commonService.socket$.subscribe((res: CrawlMessage) => { //这里只要subscribe就行,有错误处理函数
      let picType = ''
      switch (res.msgType) {
        case 'cover':
          picType = '封面图'
          break;
        case 'preview':
          picType = '预览图'
          break;
        default:
          break;
      }
      let ntfTitle = `${picType}下载成功: ${res.index}/${res.total}`
      this.ntfService.success(ntfTitle, res.message, {
        nzKey: 'messageSocket'
      })
    })
    setTimeout(() => {
      this.reloadSocketSpin = false;
    }, 500);
  }

  // ifUrl: SafeResourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('');
  crawlBtdig(item: any, index: number) {
    // this.ifUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(item.btdigUrl);
    // console.log(this.ifUrl)
    this.crawlService.crawlBtdig({
      url: item.btdigUrl
    }).subscribe(res => {
      this.torrentList = res || [];
      this.popoverVisibleList.fill(false)
      this.popoverVisibleList[index] = true;
    })
  }

  openTorrentList(item: any) {
    this.drawer.create(item.title, GalleryTorrentListComponent, {videoInfo: item}, {
      size: 1300,
      footer: false,
      drawerOptions: {nzPlacement: 'left', nzClosable: false}
    }).subscribe(res => {
      if (res.state == 'ok') {

      }
    });
  }

  async switchOnStorage(item: any) {
    let value: any = {
      id: item.id,
      onStorage: !item.onStorage
    }
    this.switchLoading = true;
    try {
      await this.videoService.update(value);
      item.onStorage = !item.onStorage;
    } catch (e) {}
    this.switchLoading = false;
  }

  async addEditLocalVideo(item: any) {
    this.modal.createStatic(VideoManageLocalVideoEditComponent, {record: { id: 0, videoInfo: item }, automated: true }, { size: 1595 }).subscribe(async res => {
      if (res == 'ok') {
        await this.videoService.checkVideoOnStorageStatus(item.id);
        this.getByPage();
      }
    });
  }

  openPlayVideoList(item: any) {
    this.modal.create(GalleryPlayVideoListComponent, {record: item}, { size: 'md', modalOptions: { nzClosable: false } }).subscribe(res => {
      if (res == 'ok') {

      }
    });
  }

  selectCoverImage(item: any) {
    if (this.onOpenDialog) {
      this.msgSrv.warning('已打开文件对话框');
      return;
    }
    this.onOpenDialog = true;
    this.fileDialogSubscription = this.commonService.selectCoverImage()
      .pipe(finalize(() => {
        this.onOpenDialog = false;
      }))
      .subscribe({
        next: async res => {
          res = res || {};
          if (res.hasOwnProperty('coverBase64')) {
            if (res.coverBase64) {
              try {
                let entity: any = {
                  id: item.id,
                  coverBase64: res.coverBase64
                }
                await this.videoService.update(entity);
                this.getByPage();
              } catch (e) {
                console.error(e);
                this.msgSrv.error('更新封面图出错');
              }
            }
          }
        },
        error: (e) => {
          console.error(e);
          this.msgSrv.error('封面图选择出错');
        }
      })
  }

  createVideoCrawlTask(item: any) {
    const videoId: number = item.id;
    let value: any = {
      id: videoId,
      crawlApiUrl: item.crawlApiUrl,
      crawlKey: item.crawlKey,
      imagePhysicalPath: item.imagePhysicalPath,
      imageServerPath: item.imageServerPath,
      imagePhysicalDirectoryName: item.imagePhysicalDirectoryName,
      imageServerDirectoryName: item.imageServerDirectoryName,
    }

    if (value.hasOwnProperty('crawlKey') && value.hasOwnProperty('crawlApiUrl')) {
      if (!(typeof value.crawlKey == 'string' && typeof value.crawlApiUrl == 'string' && value.crawlApiUrl != '')) { //直接在前端进行类型检查吧
        this.msgSrv.error('爬虫参数类型错误,请检查配置');
        return;
      }
    } else {
      this.msgSrv.error('未正确配置爬虫参数,请检查配置');
      return;
    }
    if (this.commonService.globalData.isDownloadImage) {
      if (value.hasOwnProperty('imagePhysicalPath') && value.hasOwnProperty('imageServerPath') && value.hasOwnProperty('imagePhysicalDirectoryName') && value.hasOwnProperty('imageServerDirectoryName')) {
        value.imagePhysicalPath = (typeof value.imagePhysicalPath == 'string') ? value.imagePhysicalPath : ''
        value.imageServerPath = (typeof value.imageServerPath == 'string') ? value.imageServerPath : ''
        value.imagePhysicalDirectoryName = (typeof value.imagePhysicalDirectoryName == 'string') ? value.imagePhysicalDirectoryName : ''
        value.imageServerDirectoryName = (typeof value.imageServerDirectoryName == 'string') ? value.imageServerDirectoryName : ''
      } else {
        this.msgSrv.info('图片相关配置不正确,请检查配置');
        return;
      }
    }

    value.crawlKey = value.crawlKey.trim();
    let payload: any = {
      crawlKey: value.crawlKey,
      downloadImage: this.commonService.globalData.isDownloadImage,
      imagePhysicalPath: value.imagePhysicalPath,
      imageServerPath: value.imageServerPath,
      imagePhysicalDirectoryName: value.imagePhysicalDirectoryName,
      imageServerDirectoryName: value.imageServerDirectoryName
    }

    let videoCrawlTask: VideoCrawlTask = {
      id: -1,
      videoId,
      type: 'video',
      state: 'wait',
      info: item,
      crawlApiUrl: value.crawlApiUrl,
      payload,
      data: null,
      subscription: new Subscription()
    }
    this.crawlTaskService.addVideoCrawlTask(videoId, videoCrawlTask);
    // this.crawlTaskCount = this.crawlTaskService.videoCrawlTaskList.length;
  }

  async executeVideoWorkFlow() {
    let res = (await this.crawlTaskService.executeVideoWorkFlow()) || {};
    if (res.message == 'confirm-finished') {
      await new Promise((resolve, reject) => {
        setTimeout(()=>{ resolve(true) }, 1500);
      })
      this.getByPage();
    }
  }

  async switchVideoOnClient(item: any) {
    this.switchOnClientLoading = true;
    this.videoIdOnSwitchingOnClient = item.id;
    let flag: boolean = this.videoIdListOnClient.includes(item.id)
    try {
      if (!flag) {
        await this.videoService.pushVideoOnClient(item.id);
      } else {
        await this.videoService.pullVideoOffClient(item.id);
      }
      this.videoIdListOnClient = (await this.videoService.getVideoIdListOnClient()) || [];
    } catch (e) {
      console.error(e)
    }
    this.switchOnClientLoading = false;
    this.videoIdOnSwitchingOnClient = -1;
  }

  openVideoCustomTagsEdit(id: number) {
    this.modal.createStatic(VideoManageVideoCustomTagsEditComponent, {record: {id}}).subscribe(res => {
      if (res == 'ok') {
        // 不一定需要,因为tag改动没有体现在grid视图上,不需要更新视觉效果
        // this.getByPage();
      }
    });
  }

  openVideoCustomSortOrderEdit(id: number) {
    this.modal.createStatic(VideoManageVideoCustomSortOrderEditComponent, {record: {id}}).subscribe(res => {
      if (res == 'ok') {
        this.getByPage();
      }
    });
  }

  selectSwapId(id: number) {
    let flag = this.swapIdStack.findIndex(swapId => swapId == id)
    if (flag == -1) {
      if (this.swapIdStack.length >= 2) {
        this.swapIdStack.shift();
      }
      this.swapIdStack.push(id);
    } else {
      this.swapIdStack = this.swapIdStack.filter(swapId => swapId != id);
    }
  }

  async swapCustomSortOrder() {
    if (this.swapIdStack.length > 0 && this.swapIdStack.length < 2) {
      this.swapIdStack = [];
      return;
    }
    try {
      await this.videoService.swapCustomSortOrder(this.swapIdStack[0], this.swapIdStack[1]);
      this.swapIdStack = [];
      this.getByPage();
      this.msgSrv.success('交换顺序成功');
    } catch (e) {
      console.error(e);
      this.msgSrv.error('交换顺序失败');
    }
  }

  refreshVideoGallery() {
    this.getByPage();
  }

  resetVideoGallery() {
    this.keyword = '';
    this.sort = '';
    this.swapIdStack = [];
    this.getByPage();
  }

}
