import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { SystemSettingService } from '../../../../service/system-setting/system-setting.service';
import { SystemManageSystemSettingEditComponent } from '../system-setting-edit/system-setting-edit.component';

import { lastValueFrom } from "rxjs";

@Component({
  selector: 'app-system-manage-system-setting-list',
  templateUrl: './system-setting-list.component.html',
})
export class SystemManageSystemSettingListComponent implements OnInit {
  url = `/api/osiris_system_setting/get_by_page`;
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
    { title: '配置名', index: 'settingName' },
    { title: '类型',
      index: 'settingType',
      format: (item: any) => {
        if (item.settingType == 1) { return '字符串' }
        else if (item.settingType == 2) { return '整数' }
        else if (item.settingType == 3) { return '布尔值' }
        else { return 'None' }
      }
    },
    { title: '配置键', index: 'settingKey' },
    {
      title: '配置值',
      format: (item: any) => {
        if (item.settingType == 1) { return `${item.settingStringValue}` }
        else if (item.settingType == 2) { return `${item.settingIntegerValue}` }
        else if (item.settingType == 3) { return `${item.settingBooleanValue}` }
        else { return 'None' }
      }
    },
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
    private systemSettingService: SystemSettingService
  ) { }

  ngOnInit() {

  }

  addEdit(id: number = 0): void {
    this.modal.createStatic(SystemManageSystemSettingEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.systemSettingService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

  async loadGlobalSettings() {
    try {
      await this.systemSettingService.loadGlobalSettings();
      this.msgSrv.success('载入全局变量成功');
    } catch (e) {
      console.error(e);
      this.msgSrv.error('载入全局变量失败');
    }
  }

}
