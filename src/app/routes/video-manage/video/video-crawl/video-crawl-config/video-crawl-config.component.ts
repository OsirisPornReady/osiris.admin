import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { VideoService } from '../../../../../service/video/video.service';
import { CrawlTypeService } from '../../../../../service/crawl/crawl-type.service';
import { CommonService } from '../../../../../service/common/common.service';

@Component({
  selector: 'app-video-manage-video-crawl-config',
  templateUrl: './video-crawl-config.component.html',
})
export class VideoManageVideoCrawlConfigComponent implements OnInit {
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
      imagePhysicalPath: { type: 'string', title: '图片物理根路径' },
      imageServerPath: { type: 'string', title: '图片服务器根路径' },
      imagePhysicalDirectoryName: { type: 'string', title: '图片物理文件夹名路径' },
      imageServerDirectoryName: { type: 'string', title: '图片服务器文件夹名路径' },
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
      visibleIf: {
        canCrawl: val => (val ? { required: true, show: true } : { required: false, show: true })
      },
      changeDebounceTime: 100,
      widget: 'select',
      allowClear: true,
      placeholder: '请选择导入数据源',
      width: 400,
      asyncData: () => this.crawlTypeService.getSelectAll()
    },
    $crawlKey: {
      visibleIf: {
        canCrawl: val => (val ? { required: true, show: true } : { required: false, show: true })
      },
      placeholder: '导入关键字',
    },
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoService: VideoService,
    private commonService: CommonService,
    private crawlTypeService: CrawlTypeService
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '修改数据源配置';
      let res = (await this.videoService.getById(this.record.id)) || {};
      this.i = {
        id: res?.id,
        canCrawl: res?.canCrawl,
        crawlApiUrl: res?.crawlApiUrl,
        crawlKey: res?.crawlKey,
        imagePhysicalPath: res?.imagePhysicalPath,
        imageServerPath: res?.imageServerPath,
        imagePhysicalDirectoryName: res?.imagePhysicalDirectoryName,
        imageServerDirectoryName: res?.imageServerDirectoryName
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
        await this.videoService.update(value);
        this.modal.close({ state: 'updateOk', data: {} });
      } else {
        // await this.videoService.add(value);
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
      if (!this.i.imagePhysicalPath) {
        this.sf.setValue('/imagePhysicalPath', this.commonService.globalData.imagePhysicalPath)
      }
      if (!this.i.imageServerPath) {
        this.sf.setValue('/imageServerPath', this.commonService.globalData.imageServerPath)
      }
      if (!this.i.imagePhysicalDirectoryName) {
        this.sf.setValue('/imagePhysicalDirectoryName', this.commonService.globalData.imagePhysicalDirectoryName)
      }
      if (!this.i.imageServerDirectoryName) {
        this.sf.setValue('/imageServerDirectoryName', this.commonService.globalData.imageServerDirectoryName)
      }
    } catch (e) {
      console.error(e)
    }
    if (this.i.videoType == 2 && this.i.existSerialNumber && this.i.serialNumber) {
      try {
        this.sf.setValue('/canCrawl', true)
        this.sf.setValue('/crawlApiUrl', `crawl/video/javbus`)
        this.sf.setValue('/crawlKey', this.i.serialNumber)

      } catch (e) {
        console.error(e)
      }
    }
  }

  handleFormValueChange(event: any) {
    if (event.path == '/canCrawl') {
      // this.sf.validator();
      this.sf.getProperty('/crawlApiUrl')?.updateValueAndValidity();
      this.sf.getProperty('/crawlKey')?.updateValueAndValidity();
    }
  }

}
