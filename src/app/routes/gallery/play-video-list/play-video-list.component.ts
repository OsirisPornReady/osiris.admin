import {Component, OnInit, OnDestroy, ViewChild, Input} from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {NzMessageService} from "ng-zorro-antd/message";
import {NzNotificationService} from 'ng-zorro-antd/notification';

import { VideoService } from '../../../service/video/video.service';
import {CommonService} from '../../../service/common/common.service';

import {dateStringFormatter} from "../../../shared/utils/dateUtils";
import {fallbackImageBase64} from "../../../../assets/image-base64";
import {NzModalRef} from "ng-zorro-antd/modal";




@Component({
  selector: 'app-gallery-play-video-list',
  templateUrl: './play-video-list.component.html',
  styleUrls: ['./play-video-list.component.less']
})
export class GalleryPlayVideoListComponent implements OnInit, OnDestroy {
  protected readonly fallbackImageBase64 = fallbackImageBase64;

  emptyMessage: string = '暂无数据'
  loading: boolean = false;

  title = '';
  record: any = {};
  i: any;

  localVideoList: any[] = [];

  constructor(
    private http: _HttpClient,
    private modal: NzModalRef,
    private videoService: VideoService,
    private commonService: CommonService,
    private msgSrv: NzMessageService,
    private ntfService: NzNotificationService,
  ) { }

  protected readonly dateStringFormatter = dateStringFormatter;

  async ngOnInit() {
    this.title = this.record.title;
    await this.getData();
  }

  ngOnDestroy() {

  }

  async getData() {
    this.loading = true;
    this.i = this.record;
    try {
      this.localVideoList = (await this.videoService.getLocalVideoListByVideoId(this.record.id)) || [];
    } catch (e) {
      console.error(e)
    }
    this.loading = false;
  }

  close(): void {
    this.modal.destroy();
  }

  async playVideo(item: any) {
    try {
      await this.videoService.playVideo(item);
      this.msgSrv.success('开始播放');
    } catch (e) {
      console.error(e);
      this.msgSrv.success('播放失败');
    }
  }

}
