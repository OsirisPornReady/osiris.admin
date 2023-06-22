import {Component, OnInit, OnDestroy, ViewChild, Input} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import {ModalHelper, _HttpClient, DrawerHelper} from '@delon/theme';
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from 'ng-zorro-antd/notification';

import { VideoService } from '../../../service/video/video.service';
import {VideoImageDownloadService} from '../../../service/video/video-image-download.service';
import {VideoDownloadTaskService} from '../../../service/video/video-download-task.service';
import {CommonService} from '../../../service/common/common.service';
import {CrawlService} from '../../../service/crawl/crawl.service';
import { CrawlTypeService } from '../../../service/crawl/crawl-type.service';

import {finalize, lastValueFrom, Subscription} from "rxjs";
import {dateStringFormatter} from "../../../shared/utils/dateUtils";
import {CrawlMessage} from "../../../model/CrawlMessage";
import {fallbackImageBase64} from "../../../../assets/image-base64";




@Component({
  selector: 'app-gallery-torrent-card',
  templateUrl: './torrent-list.component.html',
  styleUrls: ['./torrent-list.component.less']
})
export class GalleryTorrentListComponent implements OnInit, OnDestroy {
  protected readonly fallbackImageBase64 = fallbackImageBase64;

  @Input() videoInfo: any
  loading: boolean = false;
  @Input() torrentList: any[] = [];

  emptyMessage: string = '暂无数据'

  btdigKeyword: string = ''

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private videoService: VideoService,
    private videoImageDownloadService: VideoImageDownloadService,
    public videoDownloadTaskService: VideoDownloadTaskService,
    private commonService: CommonService,
    private crawlService: CrawlService,
    private crawlTypeService: CrawlTypeService,
    private drawer: DrawerHelper,
    private msgSrv: NzMessageService,
    private ntfService: NzNotificationService,
    private domSanitizer: DomSanitizer
  ) { }

  protected readonly dateStringFormatter = dateStringFormatter;

  ngOnInit() {
    this.getData();
  }

  ngOnDestroy() {

  }

  getData() {
    this.getBtdigKeyword();
    this.crawlBtdig(this.videoInfo);
  }

  crawlBtdig(item: any) {
    if (item) {
      this.loading = true;
      this.crawlService.crawlBtdig({
        url: item.btdigUrl
      }).pipe(finalize(() => {
        this.loading = false;
      })).subscribe({
        next: res => {
          this.torrentList = res || [];
        },
        error: () => {
          this.emptyMessage = '爬虫请求失败';
        }
      })
    }
  }

  getBtdigKeyword() {
    const btdigUrl = this.videoInfo.btdigUrl;
    if (btdigUrl) {
      let restReg = /https:\/\/btdig.com\/search\?q=/i
      this.btdigKeyword = btdigUrl.replace(restReg, '');
    }
  }

  async setBtdigKeyword() {
    const btdigUrl = `https://btdig.com/search?q=${this.btdigKeyword}`;
    try {
      await this.videoService.update({
        id: this.videoInfo.id,
        btdigUrl
      })
      this.videoInfo.btdigUrl = btdigUrl;
      this.msgSrv.success('保存成功')
    } catch (e) {
      console.error(e)
      this.msgSrv.error('保存失败')
    }
  }

  openTorrentMagnetLink(link: string) {
    // if (item.hasOwnProperty('torrent_magnet') && item.torrent_magnet) {
    //   window.open(item.torrent_magnet, '_self')
    // }
    window.open(link, '_self')
  }

  addVideoDownloadTask(item: any, index: number) {
    let task: any = {
      torrentMagnet: item.torrent_magnet,
      torrentInfo: item,
      videoInfo: this.videoInfo,
    }
    if (this.videoDownloadTaskService.downloadMissionMap.has(item.torrent_magnet)) {
      this.msgSrv.warning('该磁链任务已添加');
    } else {
      this.videoDownloadTaskService.downloadMissionMap.set(item.torrent_magnet, true);
      this.videoDownloadTaskService.videoDownloadTaskList.push(task);
      this.msgSrv.success('磁链任务添加成功');
    }
  }

}
