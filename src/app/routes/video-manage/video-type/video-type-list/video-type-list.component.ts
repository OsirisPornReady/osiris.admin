import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { VideoTypeService } from '../../../../service/video/video-type.service';
import { VideoManageVideoTypeEditComponent } from '../video-type-edit/video-type-edit.component';

@Component({
  selector: 'app-video-manage-video-type-list',
  templateUrl: './video-type-list.component.html',
})
export class VideoManageVideoTypeListComponent implements OnInit {
  url = `/video_type/get_by_page`;
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
    { title: '类型', index: 'type' },
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
          click: (item: any) => {
            this.delete(item.id);
          }
        }
      ]
    }
  ];

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private videoTypeService: VideoTypeService
  ) { }

  ngOnInit(): void { }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoTypeEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.videoTypeService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

}
