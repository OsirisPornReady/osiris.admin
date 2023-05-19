import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { SystemSettingService } from "../../../../service/system-setting/system-setting.service";

@Component({
  selector: 'app-system-manage-system-setting-edit',
  templateUrl: './system-setting-edit.component.html',
})
export class SystemManageSystemSettingEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      settingName: { type: 'string', title: '配置名' },
      settingKey: { type: 'string', title: '配置键' },
      settingType: {
        type: 'string',
        title: '值类型',
        enum: [
          { label: '字符串(1)', value: 1 },
          { label: '整数(2)', value: 2 },
          { label: '布尔值(3)', value: 3 }
        ],
        default: 0
      },
      settingStringValue: { type: 'string', title: '配置值' },
      settingIntegerValue: { type: 'number', title: '配置值' },
      settingBooleanValue: { type: 'boolean', title: '配置值' },
    },
    required: ['settingName', 'settingType', 'settingKey'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
    $settingType: {
      widget: 'select'
    },
    $settingStringValue: {
      visibleIf: {
        settingType: val => (val == 1 ? { required: true, show: true } : null)
      }
    },
    $settingIntegerValue: {
      visibleIf: {
        settingType: val => (val == 2 ? { required: true, show: true } : null)
      }
    },
    $settingBooleanValue: {
      visibleIf: {
        settingType: val => (val == 3 ? { required: true, show: true } : null)
      }
    },
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private systemSettingService: SystemSettingService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改';
      this.i = (await this.systemSettingService.getById(this.record.id)) || {};
    } else {
      this.title = '新增';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      if (this.record.id > 0) {
        await this.systemSettingService.update(value);
      } else {
        await this.systemSettingService.add(value);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }
}
