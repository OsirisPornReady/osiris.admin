import { Component, OnInit, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { VideoService } from '../../../../service/video/video.service';
import { CommonService } from '../../../../service/common/common.service';

@Component({
  selector: 'app-video-manage-video-crawl-config',
  templateUrl: './video-evaluate.component.html',
})
export class VideoManageVideoEvaluateComponent implements OnInit {
  scoreTextList: string[] = this.commonService.scoreTextList;

  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent
  schema: SFSchema = {
    properties: {
      score: { type: 'number', title: '评分', maximum: 10, multipleOf: 1 },
      comment: { type: 'string', title: '评价' },
    },
    required: ['score', 'comment'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 120,
      grid: { span: 22 },
    },
    $score: {
      widget: 'rate',
      text: ` {{value}} 分`,
      tooltips: this.scoreTextList,
    },
    $comment: {
      widget: 'textarea'
    }
  };

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoService: VideoService,
    private commonService: CommonService,
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '视频评价';
      let res = (await this.videoService.getById(this.record.id)) || {};
      this.i = {  // 少量更新可以用这种方法,这样不用写多余接口,前提是update接口为忽略null的策略
        id: res?.id,
        score: res?.score,
        comment: res?.comment
      }
    } else {
      this.title = '视频评价';
      this.i = {};
    }
  }

  async save(value: any) {
    try {
      if (this.record.id > 0) {
        await this.videoService.update(value);
      } else {
        await this.videoService.add(value);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

  autoConfigJav() {
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

}
