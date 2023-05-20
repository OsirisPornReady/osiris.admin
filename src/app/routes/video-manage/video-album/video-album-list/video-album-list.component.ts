import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VideoAlbumService } from '../../../../service/video/video-album.service';
import { VideoManageVideoAlbumEditComponent } from '../video-album-edit/video-album-edit.component';

@Component({
  selector: 'app-video-manage-video-album-list',
  templateUrl: './video-album-list.component.html',
})
export class VideoManageVideoAlbumListComponent implements OnInit {
  url = `/api/video_album/get_by_page`;

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
    { title: '专辑名', index: 'albumName' },
    { title: '专辑视频', index: 'videoList' },
    {
      title: '操作',
      buttons: [
        {
          text: '编辑',
          // type: 'static',
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
    private videoAlbumService: VideoAlbumService
  ) { }

  ngOnInit(): void { }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoAlbumEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.videoAlbumService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

}
