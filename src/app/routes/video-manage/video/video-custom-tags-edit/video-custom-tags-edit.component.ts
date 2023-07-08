import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema} from '@delon/form';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

import { VideoService } from '../../../../service/video/video.service';
import { CommonService } from '../../../../service/common/common.service';
import {debounceTime, distinctUntilChanged, Subject} from "rxjs";

@Component({
  selector: 'app-video-manage-video-custom-tags-edit',
  templateUrl: './video-custom-tags-edit.component.html',
})
export class VideoManageVideoCustomTagsEditComponent implements OnInit, OnDestroy {

  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent
  schema: SFSchema = {
    properties: {
      customTags: { type: 'string', title: '自定义标签' },
    },
    required: [],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 120,
      grid: { span: 22 },
    },
    $customTags: {
      widget: 'custom'
    }
  };

  customTags: any[] = []
  inputCustomTagValue: string = '';
  onEditCustomTags: boolean = false;
  onSwapCustomTags: boolean = false;
  tagKeyword: string = '';
  tagCheckedCount: number = 0;
  tagSwapIndexList: number[] = [];
  inputCustomTagValueStream: Subject<any> = new Subject<any>();


  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private videoService: VideoService,
    private commonService: CommonService,
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '自定义标签';
      let res = (await this.videoService.getById(this.record.id)) || {};
      this.i = {  // 少量更新可以用这种方法,这样不用写多余接口,前提是update接口为忽略null的策略
        id: res?.id,
        customTags: res?.customTags
      }
    } else {
      this.title = '自定义标签';
      this.i = {};
    }
    this.getCustomTags();
  }

  ngOnDestroy() {
    this.inputCustomTagValueStream.unsubscribe();
  }

  async save(value: any) {
    value.customTags = this.customTags.map(tag => tag.text);
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

  getCustomTags() {
    if (this.i.hasOwnProperty('customTags') && this.i.customTags) {
      this.customTags = this.i.customTags.map((tag: string) => {
        return {
          checked: false,
          text: tag
        }
      });
    } else {
      this.customTags = [];
    }
    this.inputCustomTagValueStream.pipe(
      debounceTime(400),
      distinctUntilChanged())
      .subscribe(res => {
        this.queryCustomTag();
      });
  }

  addCustomTag() {
    if (this.inputCustomTagValue) {
      let flag = this.customTags.findIndex((tag: any) => tag.text == this.inputCustomTagValue);
      if (flag == -1) {
        let addTag: any = {
          checked: false,
          text: this.inputCustomTagValue
        }
        this.customTags.push(addTag);
        this.inputCustomTagValue = '';
      } else {
        this.msgSrv.warning('标签已存在');
      }
    } else {
      this.msgSrv.warning('输入值为空');
    }
  }

  deleteCustomTag(removedTag: any) {
    this.customTags = this.customTags.filter(tag => tag.text !== removedTag.text);
  }

  swapCustomTags() {
    let posA: number = this.tagSwapIndexList[0];
    let posB: number = this.tagSwapIndexList[1];
    [this.customTags[posA], this.customTags[posB]] = [this.customTags[posB], this.customTags[posA]];
    this.tagSwapIndexList = [];
    this.customTags = this.customTags.map(tag => {
      tag.checked = false;
      return tag;
    })
  }

  handleCustomTagInputKeydownEnter() {
    if (this.onEditCustomTags) {
      if (!this.onSwapCustomTags) {
        this.addCustomTag();
      }
    } else {
      this.queryCustomTag();
    }
  }

  queryCustomTag() {
    this.tagKeyword = this.inputCustomTagValue;
  }

  handleCheckCustomTag (event: any, index: number) {
    if (event) {
      this.tagSwapIndexList.push(index);
    } else {
      this.tagSwapIndexList = this.tagSwapIndexList.filter((idx: any) => idx != index);
    }
  }

  handleSwitchOnEditCustomTags(event: any) {
    if (!event) {
      this.onSwapCustomTags = false;
      this.tagSwapIndexList = [];
      this.customTags = this.customTags.map(tag => {
        tag.checked = false;
        return tag;
      })
    }
  }

  handleInputCustomTagValue() {
    this.inputCustomTagValueStream.next(this.inputCustomTagValue);
  }

}
