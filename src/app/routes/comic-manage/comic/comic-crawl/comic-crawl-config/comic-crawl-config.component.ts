import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { ComicService } from '../../../../../service/comic/comic.service';
import { CrawlTypeService } from '../../../../../service/crawl/crawl-type.service';
import { CommonService } from '../../../../../service/common/common.service';

@Component({
  selector: 'app-comic-manage-comic-crawl-config',
  templateUrl: './comic-crawl-config.component.html',
})
export class ComicManageComicCrawlConfigComponent implements OnInit {
  autoCreateConfig: any = {};
  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent
  schema: SFSchema = {
    properties: {
      canCrawl: { type: 'boolean', title: '是否需要导入' },
      crawlApiUrl: { type: 'string', title: '导入数据源' },
      crawlKey: { type: 'string', title: '导入关键字' },
      comicPhysicalPath: { type: 'string', title: '物理地址' },
      comicServerPath: { type: 'string', title: '服务器地址' },
      comicPhysicalDirectoryName: { type: 'string', title: '物理文件夹名' },
      comicServerDirectoryName: { type: 'string', title: '服务器文件夹名' }
    },
    required: ['crawlKey', 'crawlApiUrl'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 145,
      grid: { span: 22 },
    },
    $canCrawl: {  // 现在visibleif和asyncData同时使用会重复请求,有的时候会直接冲突加载不出来,尽量还是别同时使用吧
      // change: (i: any) => {
      //   this.sf.getProperty('/crawlType')?.updateFeedback();
      //   this.sf.getProperty('/crawlKey')?.updateFeedback();
      // },
    },
    $crawlApiUrl: {
      // visibleIf: {
      //   canCrawl: val => val
      // },
      changeDebounceTime: 100,
      widget: 'select',
      allowClear: true,
      placeholder: '请选择导入数据源',
      width: 400,
      asyncData: () => this.crawlTypeService.getSelectAll()
    },
    $crawlKey: {
      // visibleIf: {
      //   canCrawl: val => val
      // },
      placeholder: '导入关键字',
    },
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private comicService: ComicService,
    private commonService: CommonService,
    private crawlTypeService: CrawlTypeService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改数据源配置';
      let res = (await this.comicService.getById(this.record.id)) || {};
      this.i = {
        id: res?.id,
        canCrawl: res?.canCrawl,
        crawlApiUrl: res?.crawlApiUrl,
        crawlKey: res?.crawlKey,
        comicPhysicalPath: res?.comicPhysicalPath,
        comicServerPath: res?.comicServerPath,
        comicPhysicalDirectoryName: res?.comicPhysicalDirectoryName,
        comicServerDirectoryName: res?.comicServerDirectoryName
      }
      setTimeout(() => {
        this.autoConfig()
      }, 200)
    } else {
      this.title = '新增数据源配置';
      // this.i = {};
      this.i = this.autoCreateConfig;
    }
  }

  async save(value: any) {
    try {
      if (this.record.id > 0) {
        await this.comicService.update(value);
        this.modal.close({ state: 'updateOk', data: {} });
      } else {
        // await this.comicService.add(value);
        this.modal.close({ state: 'configOk', data: value });
      }
      this.msgSrv.success('保存成功');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

  autoConfig() {
    try {
      if (!this.i.comicPhysicalPath) {
        this.sf.setValue('/comicPhysicalPath', this.commonService.globalData.comicPhysicalPath)
      }
      if (!this.i.comicServerPath) {
        this.sf.setValue('/comicServerPath', this.commonService.globalData.comicServerPath)
      }
      if (!this.i.comicPhysicalDirectoryName) {
        this.sf.setValue('/comicPhysicalDirectoryName', this.commonService.globalData.comicPhysicalDirectoryName)
      }
      if (!this.i.comicServerDirectoryName) {
        this.sf.setValue('/comicServerDirectoryName', this.commonService.globalData.comicServerDirectoryName)
      }
    } catch (e) {
      console.error(e)
    }
  }

}
