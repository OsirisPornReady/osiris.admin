import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { lastValueFrom } from 'rxjs';

import { AreaService } from '../../../../service/area/area.service';
import { CastService } from '../../../../service/cast/cast.service';
import { CastManageCastEditComponent } from '../cast-edit/cast-edit.component';

@Component({
  selector: 'app-cast-manage-cast-list',
  templateUrl: './cast-list.component.html',
})
export class CastManageCastListComponent implements OnInit {
  url = `/api/cast/get_by_page`;
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
    { title: '姓名', index: 'name' },
    {
      title: '性别',
      index: 'gender',
      type: 'enum',
      enum: {
        female: 'female',
        trans: 'trans'
      }
    },
    { title: '地区', render: 'customAreaInfo' },
    { title: '状态', render: 'customStatus' },
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
    private castService: CastService,
    private areaService: AreaService
  ) { }

  async ngOnInit() {

  }

  addEdit(id: number = 0): void {
    this.modal.createStatic(CastManageCastEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.castService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

}
