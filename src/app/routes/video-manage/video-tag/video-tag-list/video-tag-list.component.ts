import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { VideoManageVideoTagEditComponent } from "../video-tag-edit/video-tag-edit.component";
import { VideoManageVideoTagService } from "../../../../service/video/video-tag.service";

@Component({
  selector: 'app-video-manage-video-tag-list',
  templateUrl: './video-tag-list.component.html',
})
export class VideoManageVideoTagListComponent implements OnInit {
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
    { title: 'ID', index: 'id' },
    { title: '标签', index: 'tag' },
    { title: '引用次数', type: 'number', index: 'refCount' },
    { title: '时间', type: 'date', index: 'updatedTime' },
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
    private videoTagService: VideoManageVideoTagService
  ) { }

  ngOnInit(): void { }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoTagEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.videoTagService.delete(id);
    } catch (e) {
      console.error(e);
    }
  }

}
