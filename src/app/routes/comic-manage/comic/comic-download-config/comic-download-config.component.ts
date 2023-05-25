import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { TransferChange } from 'ng-zorro-antd/transfer';
import { TransferSelectChange } from 'ng-zorro-antd/transfer';

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
      comicPhysicalPath: { type: 'string', title: '物理地址' },
      comicServerPath: { type: 'string', title: '服务器地址' },
      comicPhysicalDirectoryName: { type: 'string', title: '物理文件夹名' },
      comicServerDirectoryName: { type: 'string', title: '服务器文件夹名' },
      downloadMode: { type: 'boolean', title: '下载模式' },
      downloadAllButton: { type: 'string', title: '全部下载' },
      startPage: { type: 'number', title: '开始页' },
      endPage: { type: 'number', title: '结束页' },
      pageSelect: {
        type: 'string',
        title: '下载页选择',
      }
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
    $downloadMode: {
      checkedChildren: '单页下载',
      unCheckedChildren: '范围下载'
    },
    $startPage: {
      unit: '页',
      widgetWidth: 150,
      precision: 0,
      visibleIf: {
        downloadMode: val => (val ? null : { required: true, show: true })
      }
    },
    $endPage: {
      unit: '页',
      widgetWidth: 150,
      precision: 0,
      visibleIf: {
        downloadMode: val => (val ? null : { required: true, show: true })
      }
    },
    $downloadAllButton: {
      widget: 'custom',
      visibleIf: {
        downloadMode: val => (val ? null : { show: true })
      }
    },
    $pageSelect: {
      widget: 'custom',
      visibleIf: {
        downloadMode: val => (val ? { show: true } : null)
      }
    }
  };

  comicPicLinkList: any[] = [];
  comicFailOrderList: any[] = [];
  pageList: TransferItem[] = [];
  $asTransferItems = (data: unknown): TransferItem[] => {
    this.downloadPageList = data as TransferItem[];
    return data as TransferItem[]
  };
  pageSelectDisabled = false;
  pageSelectShowSearch = true;
  downloadPageList: any[] = [];
  pageSize: number = 0;

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
      this.pageSize = res?.pageSize;
      this.comicPicLinkList = res.comicPicLinkList || [];
      this.comicFailOrderList = res.comicFailOrderList || [];
    } else {
      this.title = '新增数据源配置';
      this.i = {};
    }

    for (let i = 0; i < this.comicPicLinkList.length; i++) {
      this.pageList.push({
        key: i + 1,
        title: `page ${i + 1}${this.comicFailOrderList[i] == '-' ? '' : '(未下载)'}`, // 方便搜索的
        description: `第${i + 1}页`,
        disabled: false,
        tag: this.comicFailOrderList[i] == '-' ? { label: '已下载', value: true } : { label: '未下载', value: false },
        checked: false
      });
    }
  }

  async save(value: any) {
    try {
      // if (this.record.id > 0) {
      //   await this.comicService.update(value);
      // } else {
      //   await this.comicService.add(value);
      // }
      if (value.hasOwnProperty('startPage') && value.hasOwnProperty('startPage')) {
        if ((value.startPage >= 1 && value.startPage <= this.pageSize) && (value.endPage >= 1 && value.endPage <= this.pageSize) && (value.startPage <= value.endPage)) {
          value.downloadPageList = Array.from(new Array(value.endPage + 1).keys()).slice(value.startPage);
        }
      } else {
        if (this.downloadPageList.length > 0) {
          value.downloadPageList = this.downloadPageList.map((i:any) => {
            return i.key
          });
        } else {
          this.msgSrv.warning('还未选择要下载的页');
          return;
        }
      }
      this.msgSrv.success('开始下载');
      this.modal.close({ state: 'ok', data: value });
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

  selectPage(ret: TransferSelectChange): void {
    // console.log('nzSelectChange', ret);
  }

  transferPage(ret: TransferChange): void {
    // console.log('nzChange', ret);
    const listKeys = ret.list.map(l => l['key']);
    const hasOwnKey = (e: TransferItem): boolean => e.hasOwnProperty('key');
    this.pageList = this.pageList.map(e => {
      if (listKeys.includes(e['key']) && hasOwnKey(e)) {
        if (ret.to === 'left') {
          delete e.hide;
        } else if (ret.to === 'right') {
          e.hide = false;
        }
      }
      return e;
    });
  }

  downloadAll() {
    this.sf.getProperty('/startPage')?.setValue(1, false);
    this.sf.getProperty('/endPage')?.setValue(this.pageSize, false);
  }

}
