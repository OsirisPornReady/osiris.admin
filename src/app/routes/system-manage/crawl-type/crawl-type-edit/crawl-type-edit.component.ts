import { Component, OnInit } from '@angular/core';
import { SFSchema, SFUISchema } from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { CrawlTypeService } from '../../../../service/crawl/crawl-type.service';

@Component({
  selector: 'app-system-manage-crawl-type-edit',
  templateUrl: './crawl-type-edit.component.html',
})
export class SystemManageCrawlTypeEditComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  schema: SFSchema = {
    properties: {
      name: { type: 'string', title: '名字' },
      crawlTypeKey: { type: 'number', title: 'Key' },
      crawlApiUrl: { type: 'string', title: '接口地址' },
      isActive: { type: 'boolean', title: '是否启用' },
    },
    required: ['name', 'crawlTypeKey', 'crawlApiUrl'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
    $crawlTypeKey: {
      precision: 0
    },
    $crawlApiUrl: {

    }
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private crawlTypeService: CrawlTypeService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改';
      this.i = (await this.crawlTypeService.getById(this.record.id)) || {};
    } else {
      this.title = '新增';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      if (this.record.id > 0) {
        await this.crawlTypeService.update(value);
      } else {
        await this.crawlTypeService.add(value);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }
}
