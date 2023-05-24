import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { ComicService } from '../../../../service/comic/comic.service';
import { CrawlTypeService } from '../../../../service/crawl/crawl-type.service';

@Component({
  selector: 'app-comic-manage-comic-download-config',
  templateUrl: './comic-download-config.component.html',
})
export class ComicManageComicDownloadConfigComponent implements OnInit {
  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent
  schema: SFSchema = {
    properties: {
      pageSize: { type: 'number', title: '总页数' },
      existSeed: { type: 'boolean', title: '有无种子' },
      startPage: { type: 'number', title: '开始页' },
      endPage: { type: 'number', title: '结束页' },
      comicPhysicalPath: { type: 'string', title: '物理地址' },
      comicServerPath: { type: 'string', title: '服务器地址' },
      comicPhysicalDirectoryName: { type: 'string', title: '物理文件夹名' },
      comicServerDirectoryName: { type: 'string', title: '服务器文件夹名' }
    },
    required: ['startPage', 'endPage', 'comicPhysicalPath', 'comicServerPath', 'comicPhysicalDirectoryName', 'comicServerDirectoryName'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 145,
      grid: { span: 22 },
    },
    $pageSize: {
      widget: 'text',
    },
    $startPage: {
      unit: '页',
      widgetWidth: 150,
      precision: 0
    },
    $endPage: {
      unit: '页',
      widgetWidth: 150,
      precision: 0
    },
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private comicService: ComicService,
    private crawlTypeService: CrawlTypeService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '下载配置';
      let res = (await this.comicService.getById(this.record.id)) || {};
      this.i = {
        id: res?.id,
        pageSize: res?.pageSize,
        existSeed: res?.existSeed,
        comicPhysicalPath: res?.comicPhysicalPath,
        comicServerPath: res?.comicServerPath,
        comicPhysicalDirectoryName: res?.comicPhysicalDirectoryName,
        comicServerDirectoryName: res?.comicServerDirectoryName
      }
    } else {
      this.title = '新增数据源配置';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      // if (this.record.id > 0) {
      //   await this.comicService.update(value);
      // } else {
      //   await this.comicService.add(value);
      // }
      this.msgSrv.success('开始下载');
      this.modal.close({ state: 'ok', data: value });
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

}
