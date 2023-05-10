import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VideoQualityService } from '../../../../service/video/video-quality.service';
import { VideoManageVideoQualityEditComponent } from '../video-quality-edit/video-quality-edit.component';

@Component({
  selector: 'app-video-manage-video-quality-list',
  templateUrl: './video-quality-list.component.html',
})
export class VideoManageVideoQualityListComponent implements OnInit {
  url = `/api/video_quality/get_by_page`;

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
    { title: 'ID', index: 'id' },
    { title: '分辨率', index: 'quality' },
    { title: '标签颜色', index: 'color' },
    { title: '该分辨率下的视频数', type: 'number', index: 'videoCount' },
    { title: '更新时间', type: 'date', index: 'updateTime' },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          type: 'static',
          click: (item: any) => {
            this.addEdit(item.id);
          }
        },
        {
          text: '删除',
          type: 'del',
          pop: true,
          click: async (item: any) => {
            await this.delete(item.id);
          }
        }
      ]
    }
  ];

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private videoQualityService: VideoQualityService
  ) { }

  ngOnInit(): void { }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoQualityEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.videoQualityService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

}
