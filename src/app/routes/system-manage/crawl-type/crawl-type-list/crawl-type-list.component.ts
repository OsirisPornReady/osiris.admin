import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CrawlTypeService } from '../../../../service/crawl/crawl-type.service';
import { SystemManageCrawlTypeEditComponent } from '../crawl-type-edit/crawl-type-edit.component';

@Component({
  selector: 'app-system-manage-area-list',
  templateUrl: './crawl-type-list.component.html',
})
export class SystemManageCrawlTypeListComponent implements OnInit {
  url = `/api/crawl_type/get_by_page`;
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
    { title: '名字', index: 'name' },
    { title: '配置值', index: 'crawlTypeKey' },
    { title: '是否启用', index: 'isActive' },
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
    private crawlTypeService: CrawlTypeService
  ) { }

  ngOnInit(): void { }

  addEdit(id: number = 0): void {
    this.modal.createStatic(SystemManageCrawlTypeEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.crawlTypeService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

}
