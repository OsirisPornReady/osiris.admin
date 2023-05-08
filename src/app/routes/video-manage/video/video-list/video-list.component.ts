import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STColumnBadge, STColumnTag, STComponent, STData, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VideoService } from '../../../../service/video/video.service';
import { VideoManageVideoEditComponent } from '../video-edit/video-edit.component';

@Component({
  selector: 'app-video-manage-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.less']
})
export class VideoManageVideoListComponent implements OnInit {
  url = `/video/get_by_page`;

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
  BADGE: STColumnBadge = {
    1: { text: '成功', color: 'success' },
    2: { text: '错误', color: 'error' },
    3: { text: '进行中', color: 'processing' },
    4: { text: '默认', color: 'default' },
    5: { text: '警告', color: 'warning' }
  };
  TAG: STColumnTag = {
    true: { text: '已入库', color: 'green' },
    false: { text: '未入库', color: 'red' }
  };
  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '标题', index: 'title', width: 550 },
    {
      title: '番号',
      index: 'serialNumber',
      width: 250,
      format: (item, col, index) => {
        return item.existSerialNumber ? item.serialNumber : '-';
      }
    },
    { title: '发行时间', type: 'date', dateFormat: 'yyyy-MM-dd', index: 'publishTime' },
    { title: '状态', index: 'existSerialNumber', type: 'tag', tag: this.TAG },
    // { title: '头像', type: 'img', width: '50px', index: 'avatar' },
    {
      title: '操作',
      buttons: [
        // { text: '查看', click: (item: any) => `/form/${item.id}` },
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
    private videoService: VideoService
  ) { }

  ngOnInit(): void { }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.videoService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

  rowClassName(record: STData, index: number) {
    if (record['existSerialNumber']) {
      return 'sign-tr';
    } else return '';
  }

}
