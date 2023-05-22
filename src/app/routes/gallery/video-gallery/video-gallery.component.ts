import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';

import { VideoService } from '../../../service/video/video.service';

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
    private videoService: VideoService
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

}
