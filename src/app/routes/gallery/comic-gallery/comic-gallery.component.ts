import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import {ModalHelper, _HttpClient, DrawerHelper} from '@delon/theme';
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from 'ng-zorro-antd/notification';

import { ComicService } from '../../../service/comic/comic.service';
import { ComicDownloadService } from '../../../service/comic/comic-download.service';
import { CommonService} from '../../../service/common/common.service';
import { CrawlTypeService } from '../../../service/crawl/crawl-type.service';


import { ComicManageComicEditComponent} from "../../comic-manage/comic/comic-edit/comic-edit.component";
import { ComicManageComicCrawlInfoComponent} from "../../comic-manage/comic/comic-crawl/comic-crawl-info/comic-crawl-info.component";
import { ComicManageComicInfoComponent } from "../../comic-manage/comic/comic-info/comic-info.component";
import { ComicManageComicCrawlConfigComponent } from "../../comic-manage/comic/comic-crawl/comic-crawl-config/comic-crawl-config.component";
import {finalize, fromEvent, lastValueFrom, Subscription} from "rxjs";
import {dateStringFormatter} from "../../../shared/utils/dateUtils";
import {CrawlMessage} from "../../../model/CrawlMessage";
import { fallbackImageBase64 } from "../../../../assets/image-base64";


@Component({
  selector: 'app-gallery-comic-gallery',
  templateUrl: './comic-gallery.component.html',
  styleUrls: ['./comic-gallery.component.less']
})
export class GalleryComicGalleryComponent implements OnInit, OnDestroy {
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

  protected readonly fallbackImageBase64 = fallbackImageBase64;

  pi: number = 1;
  ps: number = 8;
  total: number = 0;
  psOptions: number[] = [8, 12, 16]
  gridList: any[] = []
  loading: boolean = false;

  crawlKey: string = '';
  crawlTypeOptions: any[] = [];
  crawlApiUrl: any = null;
  comicPhysicalPath: string = '';
  comicServerPath: string = '';
  comicPhysicalDirectoryName: string = '';
  comicServerDirectoryName: string = '';

  showDelete: boolean = false;
  keyword: string = '';

  savedPi: any = null;

  messageSocketSubscription: Subscription = new Subscription();
  reloadSocketSpin: boolean = false;

  onDownloadingComic: boolean = false;
  comicIdOnDownloading: number[] = [];

  downloadFinishSubscription: Subscription = new Subscription();

  comicIdListOwnLocal: number[] = [];

  keydownSubscription: Subscription = new Subscription();
  keyupSubscription: Subscription = new Subscription();
  ctrlPressed: boolean = true;

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private comicService: ComicService,
    private comicDownloadService: ComicDownloadService,
    private commonService: CommonService,
    private crawlTypeService: CrawlTypeService,
    private drawer: DrawerHelper,
    private msgSrv: NzMessageService,
    private ntfService: NzNotificationService,
  ) { }

  protected readonly dateStringFormatter = dateStringFormatter;

  async ngOnInit() {
    try {
      this.comicIdListOwnLocal = (await this.comicService.getComicIdListOwnLocal()) || [];
    } catch (e) {
      console.error(e);
    }
    this.getByPage();
    this.crawlTypeOptions = (await lastValueFrom(this.crawlTypeService.getSelectAll())) || [];
    this.crawlApiUrl = this.crawlTypeOptions.length > 0 ? this.crawlTypeOptions[5].value : null;
    this.comicPhysicalPath = this.commonService.globalData.comicPhysicalPath
    this.comicServerPath = this.commonService.globalData.comicServerPath
    this.comicPhysicalDirectoryName = this.commonService.globalData.comicPhysicalDirectoryName
    this.comicServerDirectoryName = this.commonService.globalData.comicServerDirectoryName

    this.downloadFinishSubscription = this.comicDownloadService.downloadFinishSubject.subscribe(async (res: any) => {
      this.comicIdOnDownloading = this.comicIdOnDownloading.filter((id: number) => {
        return id != res.id;
      })
      this.onDownloadingComic = this.comicIdOnDownloading.length != 0;
      if (res.update) {
        this.getByPage();
      }
    })
    this.comicIdOnDownloading = Array.from(this.comicDownloadService.downloadMissionMap.keys())
    this.onDownloadingComic = this.comicIdOnDownloading.length != 0;
    this.keydownSubscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe(event => {
      if (event.key == 'Control') {
        this.ctrlPressed = true;
      }
      if (this.ctrlPressed && event.key == ' ') {
        navigator.clipboard.readText().then(clipText => {
          if (clipText) {
            this.crawlKey = clipText;
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
    this.messageSocketSubscription.unsubscribe();
  }

  add(): void {
    // this.modal
    //   .createStatic(FormEditComponent, { i: { id: 0 } })
    //   .subscribe(() => this.st.reload());
  }

  getByPage() {
    let url = `api/comic/get_by_page?pi=${this.pi}&ps=${this.ps}`
    if (this.keyword) {
      url = `${url}&keyword=${this.keyword}`;
    }
    this.loading = true;
    this.http.get(url).pipe(finalize(() => {
      this.loading = false;
    })).subscribe((res: any) => {
      this.total = res.total;
      this.gridList = res.list;
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
    this.drawer.create('', ComicManageComicInfoComponent, {record: {id}}, {
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
    this.modal.createStatic(ComicManageComicCrawlConfigComponent, {record: {id}}).subscribe(res => {
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
      comicPhysicalPath: item.comicPhysicalPath,
      comicServerPath: item.comicServerPath,
      comicPhysicalDirectoryName: item.comicPhysicalDirectoryName,
      comicServerDirectoryName: item.comicServerDirectoryName,
      onlyCrawlInfo: item.onlyCrawlInfo
    }
    if (value.hasOwnProperty('crawlApiUrl') && value.hasOwnProperty('crawlKey')) {
      this.drawer.static('爬取信息', ComicManageComicCrawlInfoComponent, {record: value}, {
        size: 1600,
        drawerOptions: {nzClosable: false}
      }).subscribe(res => {
        if (res.state == 'ok') {
          this.modal.createStatic(ComicManageComicEditComponent, {
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
        comicPhysicalPath: this.comicPhysicalPath,
        comicServerPath: this.comicServerPath,
        comicPhysicalDirectoryName: this.comicPhysicalDirectoryName,
        comicServerDirectoryName: this.comicServerDirectoryName,
      }
      this.getCrawl(value, null);
    }
  }

  async delete(id: number = 0) {
    try {
      await this.comicService.delete(id);
      this.msgSrv.success('删除成功');
      this.getByPage();
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

  downloadComic(item: any, event: any) {
    event.stopPropagation();
    if (this.onDownloadingComic && this.comicIdOnDownloading.includes(item.id)) {
      let mission: any = this.comicDownloadService.downloadMissionMap.get(item.id)
      if (mission) {
        mission.subscription.unsubscribe();
        return;
      }
    }
    this.onDownloadingComic = true;
    this.comicIdOnDownloading.push(item.id);
    let pageList: number[] = Array.from(new Array(item.pageSize + 1).keys()).slice(1);
    let taskInfo: any = {
      id: item.id,
      comicPhysicalPath: item.comicPhysicalPath,
      comicServerPath: item.comicServerPath,
      comicPhysicalDirectoryName: item.comicPhysicalDirectoryName,
      comicServerDirectoryName: item.comicServerDirectoryName,
      comicPicLinkList: item.comicPicLinkList ? item.comicPicLinkList : [],
      localComicPicSrcList: item.localComicPicSrcList ? item.localComicPicSrcList : [],
      comicFailOrderList: item.comicFailOrderList ? item.comicFailOrderList : [],
      pageList: pageList
    }
    this.comicDownloadService.createDownloadTask(taskInfo, item);
  }

  stopDownloadComic(item: any, event: any) {
    event.stopPropagation();
    if (this.onDownloadingComic && this.comicIdOnDownloading.includes(item.id)) {
      let mission: any = this.comicDownloadService.downloadMissionMap.get(item.id)
      if (mission) {
        mission.subscription.unsubscribe();
      }
    }
  }

  async checkComic(item: any, event: any) {
    event.stopPropagation();
    console.log('哈哈')
    let pageList = Array.from(new Array(item.pageSize + 1).keys()).slice(1)
    let checkRes: boolean = await this.comicDownloadService.checkLocalExhentaiComicPages(item, pageList)
    if (checkRes) {
      await this.getByPage();
    }
  }

}
