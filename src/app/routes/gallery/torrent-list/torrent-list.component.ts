import {Component, OnInit, OnDestroy, ViewChild, Input} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import {ModalHelper, _HttpClient, DrawerHelper} from '@delon/theme';
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from 'ng-zorro-antd/notification';

import { VideoService } from '../../../service/video/video.service';
import {VideoImageDownloadService} from '../../../service/video/video-image-download.service';
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

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private videoService: VideoService,
    private videoImageDownloadService: VideoImageDownloadService,
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
    this.crawlBtdig(this.videoInfo);
  }

  ngOnDestroy() {

  }

  crawlBtdig(item: any) {
    if (item) {
      this.loading = true;
      this.crawlService.crawlBtdig({
        url: item.btdigUrl
      }).pipe(finalize(() => {

      })).subscribe(res => {
        this.torrentList = res || [];
        this.loading = false;
      })
    }
  }

  openTorrentMagnetLink(item: any) {
    if (item.hasOwnProperty('torrent_magnet') && item.torrent_magnet) {
      window.open(item.torrent_magnet)
    }
  }

}
