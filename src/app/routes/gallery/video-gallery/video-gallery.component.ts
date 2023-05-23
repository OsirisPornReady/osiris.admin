import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import {ModalHelper, _HttpClient, DrawerHelper} from '@delon/theme';
import {NzMessageService} from "ng-zorro-antd/message";

import { VideoService } from '../../../service/video/video.service';

import {VideoManageVideoEditComponent} from '../../video-manage/video/video-edit/video-edit.component';
import { VideoManageVideoCrawlInfoComponent } from '../../video-manage/video/video-crawl/video-crawl-info/video-crawl-info.component';
import { VideoManageVideoInfoComponent } from '../../video-manage/video/video-info/video-info.component';
import {
  VideoManageVideoCrawlConfigComponent
} from "../../video-manage/video/video-crawl/video-crawl-config/video-crawl-config.component";


@Component({
  selector: 'app-gallery-video-gallery',
  templateUrl: './video-gallery.component.html',
  styleUrls: ['./video-gallery.component.less']
})
export class GalleryVideoGalleryComponent implements OnInit {
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

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private videoService: VideoService,
    private drawer: DrawerHelper,
    private msgSrv: NzMessageService,
  ) { }

  ngOnInit(): void {
    this.getByPage();
  }

  add(): void {
    // this.modal
    //   .createStatic(FormEditComponent, { i: { id: 0 } })
    //   .subscribe(() => this.st.reload());
  }

  getByPage() {
    let url = `api/video/get_by_page?pi=${this.pi}&ps=${this.ps}`
    this.http.get(url).subscribe((res: any) => {
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

  setConfig(event: any, id: number) {
    event.stopPropagation();
    this.modal.createStatic(VideoManageVideoCrawlConfigComponent, {record: {id}}).subscribe(res => {
      if (res == 'ok') {
        this.getByPage();
      }
    });
  }

  getCrawl(event: any, item: any) {
    event.stopPropagation();
    let value = {
      id: item.id,
      crawlApiUrl: item.crawlApiUrl,
      crawlKey: item.crawlKey
    }
    if (value.hasOwnProperty('crawlApiUrl') && value.hasOwnProperty('crawlKey')) {
      this.drawer.create('爬取信息', VideoManageVideoCrawlInfoComponent, {record: value}, {
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

}
