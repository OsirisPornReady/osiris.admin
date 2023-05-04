import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { AreaService } from '../../../../service/area/area.service';
import { CastService } from '../../../../service/cast/cast.service';

@Component({
  selector: 'app-cast-manage-cast-edit',
  templateUrl: './cast-edit.component.html',
})
export class CastManageCastEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      name: { type: 'string', title: '姓名' },
      area: { type: 'string', title: '地区' }
    },
    required: ['name'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
    $area: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择地区',
      width: 400,
      mode: 'tags',
      default: null,
      asyncData: () => this.areaService.getSelectAll()
    }
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private castService: CastService,
    private areaService: AreaService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改';
      this.i = (await this.castService.getById(this.record.id)) || {};
    } else {
      this.title = '新增';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      if (this.record.id > 0) {
        await this.castService.update(value);
      } else {
        await this.castService.add(value);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }
}
