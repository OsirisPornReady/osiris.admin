import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ComicDownloadService } from '../../../../service/comic/comic-download.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-comic-manage-comic-download-task-list',
  templateUrl: './comic-download-task-list.component.html',
})
export class ComicManageComicDownloadTaskListComponent implements OnInit {
  // url = `/api/video_quality/get_by_page`;

  data: any;
  page: STPage = {
    showSize: true,
    pageSizes: [10, 20, 30, 40, 50],
    showQuickJumper: true,
  };
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
    { title: 'ID', index: 'comicInfo.id' },
    { title: '漫画名', index: 'comicInfo.title' },
    // { title: '标签颜色', index: 'color' },
    // { title: '该分辨率下的视频数', type: 'number', index: 'videoCount' },
    // { title: '更新时间', type: 'date', index: 'updateTime' },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          // type: 'static',
          click: (item: any) => {
            // this.addEdit(item.id);
          }
        },
        {
          text: '停止',
          type: 'del',
          pop: true,
          click: async (item: any) => {
            // await this.delete(item.id);
          }
        }
      ]
    }
  ];

  downloadFinishSubscription: Subscription = new Subscription();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private comicDownloadService: ComicDownloadService
  ) { }

  ngOnInit(): void {
    this.downloadFinishSubscription = this.comicDownloadService.downloadFinishSubject.subscribe(async (res: any) => {
      if (res.update) {
        this.getData();
        this.st.reload(null, {merge: true, toTop: false});
      }
    })
    this.getData();
  }

  getData() {
    this.data = Array.from(this.comicDownloadService.downloadMissionMap.values());
  }

  addEdit(id: number = 0): void {
    // this.modal.createStatic(VideoManageVideoQualityEditComponent, { record: { id } }).subscribe(res => {
    //   if (res == 'ok') {
    //     this.st.reload();
    //   }
    // });
  }

  async delete(id: number = 0) {
    try {
      // await this.videoQualityService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

}
