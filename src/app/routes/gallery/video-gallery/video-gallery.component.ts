import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import {ModalHelper, _HttpClient, DrawerHelper} from '@delon/theme';
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from 'ng-zorro-antd/notification';

import { VideoService } from '../../../service/video/video.service';
import {VideoImageDownloadService} from '../../../service/video/video-image-download.service';
import {CommonService} from '../../../service/common/common.service';
import { DataUrlDetectService } from '../../../service/common/dataUrl.detect.service';
import {CrawlService} from '../../../service/crawl/crawl.service';
import { CrawlTypeService } from '../../../service/crawl/crawl-type.service';

import { VideoManageVideoEditComponent } from '../../video-manage/video/video-edit/video-edit.component';
import { VideoManageVideoCrawlInfoComponent } from '../../video-manage/video/video-crawl/video-crawl-info/video-crawl-info.component';
import { VideoManageVideoInfoComponent } from '../../video-manage/video/video-info/video-info.component';
import { VideoManageVideoCrawlConfigComponent } from '../../video-manage/video/video-crawl/video-crawl-config/video-crawl-config.component';
import {GalleryTorrentListComponent} from '../torrent-list/torrent-list.component';
import {GalleryPlayVideoListComponent} from '../play-video-list/play-video-list.component';

import {finalize, fromEvent, lastValueFrom, Subscription} from "rxjs";
import {dateStringFormatter} from "../../../shared/utils/dateUtils";
import {CrawlMessage} from "../../../model/CrawlMessage";
import {fallbackImageBase64} from "../../../../assets/image-base64";



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

  showDelete: boolean = false;
  keyword: string = '';

  savedPi: any = null;

  messageSocketSubscription: Subscription = new Subscription();
  reloadSocketSpin: boolean = false;

  imageDownloadFinishSubscription: Subscription = new Subscription();

  torrentList: any[] = []
  popoverVisibleList: boolean[] = []

  keydownSubscription: Subscription = new Subscription();
  keyupSubscription: Subscription = new Subscription();
  ctrlPressed: boolean = false;

  switchLoading: boolean = false;

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private videoService: VideoService,
    private videoImageDownloadService: VideoImageDownloadService,
    private commonService: CommonService,
    private dataUrlDetectService: DataUrlDetectService,
    private crawlService: CrawlService,
    private crawlTypeService: CrawlTypeService,
    private drawer: DrawerHelper,
    private msgSrv: NzMessageService,
    private ntfService: NzNotificationService,
    private domSanitizer: DomSanitizer
  ) { }

  protected readonly dateStringFormatter = dateStringFormatter;

  async ngOnInit() {
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
      if (this.ctrlPressed && event.key == ' ') {
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

  getCrawl(item: any, event: any) {
    if (event) {
      event.stopPropagation();
    }
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
      this.getCrawl(value, null);
    }
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

  openPlayVideoList(item: any) {
    this.modal.create(GalleryPlayVideoListComponent, {record: item}, { size: 'md', modalOptions: { nzClosable: false } }).subscribe(res => {
      if (res == 'ok') {

      }
    });
  }

}
