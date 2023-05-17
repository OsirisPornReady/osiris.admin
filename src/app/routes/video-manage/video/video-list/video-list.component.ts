import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STColumnBadge, STColumnTag, STComponent, STData, STPage, STMultiSort } from '@delon/abc/st';
import { SFCheckboxWidgetSchema, SFSchema, SFUISchema, SFSchemaEnumType } from '@delon/form';
import { ModalHelper, _HttpClient, DrawerHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from "ng-zorro-antd/modal";

import { VideoQualityService } from '../../../../service/video/video-quality.service';
import { VideoService } from '../../../../service/video/video.service';
import { CommonService } from '../../../../service/common/common.service';
import { CrawlTypeService } from '../../../../service/crawl/crawl-type.service';
import { VideoManageVideoEditComponent } from '../video-edit/video-edit.component';
import { VideoManageVideoCrawlInfoComponent } from '../video-crawl/video-crawl-info/video-crawl-info.component';
import { VideoManageVideoCrawlConfigComponent } from '../video-crawl/video-crawl-config/video-crawl-config.component';
import { VideoManageVideoInfoComponent } from "../video-info/video-info.component";

import { dateCompare } from "../../../../shared/utils/dateUtils";
import { lastValueFrom } from "rxjs";

@Component({
  selector: 'app-video-manage-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.less']
})
export class VideoManageVideoListComponent implements OnInit {
  url = `/api/video/get_by_page`; //?sort=publishTime desc

  page: STPage = {
    showSize: true,
    pageSizes: [10, 20, 30, 40, 50],
    showQuickJumper: true
  };
  searchParam: any = {
    // searchField: null
  }
  searchSchema: SFSchema = {
    properties: {
      searchField: {
        type: 'string',
        title: '搜索字段',
        enum: [
          { label: '标题', value: 'title' },
          { label: '番号', value: 'serialNumber' },
          { label: '演员', value: 'starsRaw' },
          { label: '标签', value: 'tagsRaw' },
          { label: '发行时间', value: 'publishTimeStart' },
          { label: '添加时间', value: 'addTimeStart' },
        ],
        default: ['title']
      },
      title: {
        type: 'string',
        title: '标题'
      },
      serialNumber: {
        type: 'string',
        title: '番号'
      },
      starsRaw: {
        type: 'string',
        title: '演员'
      },
      tagsRaw: {
        type: 'string',
        title: '标签'
      },
      publishTimeStart: {
        type: 'string',
        title: '发行时间',
        ui: {
          widget: 'date',
          rangeMode: 'date',
          end: 'publishTimeEnd',
          format: 'yyyy-MM-dd',
        },
      },
      publishTimeEnd: {
        type: 'string',
      },
      addTimeStart: {
        type: 'string',
        title: '添加时间',
        ui: {
          widget: 'date',
          rangeMode: 'date',
          end: 'addTimeEnd',
          format: 'yyyy-MM-dd',
        },
      },
      addTimeEnd: {
        type: 'string',
      }
    }
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
    $searchField: {
      widget: 'checkbox',
      span: 6, // 指定每一项 8 个单元的布局
      checkAll: true,
    },
    $title: {
      visibleIf: { searchField: value => Array.isArray(value) ? value.includes('title') : false },
    },
    $serialNumber: {
      visibleIf: { searchField: value => Array.isArray(value) ? value.includes('serialNumber') : false },
    },
    $starsRaw: {
      visibleIf: { searchField: value => Array.isArray(value) ? value.includes('starsRaw') : false },
    },
    $tagsRaw: {
      visibleIf: { searchField: value => Array.isArray(value) ? value.includes('tagsRaw') : false },
    },
    $publishTimeStart: {
      visibleIf: { searchField: value => Array.isArray(value) ? value.includes('publishTimeStart') : false },
    },
    $addTimeStart: {
      visibleIf: { searchField: value => Array.isArray(value) ? value.includes('addTimeStart') : false },
    },
  };
  statusBADGE: STColumnBadge = {
    1: { text: '已入库', color: 'success' },
    2: { text: '未上架', color: 'warning' },
    3: { text: '未入库', color: 'processing' },
    4: { text: '无资源', color: 'error' },
    5: { text: '默认', color: 'default' }
  };
  qualityTAG: STColumnTag = {
    '1': { text: '成功', color: 'green' },
    '2': { text: '错误', color: 'red' },
    '3': { text: '进行中', color: 'blue' },
    '4': { text: '默认', color: '' },
    '5': { text: '警告', color: 'orange' },
  };
  multiSort: STMultiSort = {
    arrayParam: true
  }
  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: 'ID', index: 'id', type: 'checkbox', iif: () => this.isOpenMultiSelect },
    // { title: '关注', width: 70, render: 'customVideoOnSubscription', className: 'text-center' },
    { title: '标题', index: 'title', width: 550 },
    {
      title: '番号',
      index: 'serialNumber',
      width: 150,
      format: (item, col, index) => {
        return item.existSerialNumber ? item.serialNumber : '-';
      },
      className: 'text-center',
      sort: true
    },
    { title: '发行时间', type: 'date', dateFormat: 'yyyy-MM-dd', index: 'publishTime', sort: true },
    { title: '资源状态', render: 'customVideoStatus', className: 'text-center' },
    { title: '订阅', render: 'customSwitchVideoSubscription', className: 'text-center' },
    { title: '质量', render: 'customVideoQuality', className: 'text-center' },
    { title: '爬虫', render: 'customVideoInfoCrawlButton', className: 'text-center' },
    // { title: '头像', type: 'img', width: '50px', index: 'avatar' },
    {
      title: '操作',
      buttons: [
        {
          text: '查看',
          click: (item: any) => {
            // `/form/${item.id}`
            this.checkVideoInfo(item.id)
          },
          iif: () => !this.isEditMode
        },
        {
          text: '配置',
          click: (item: any) => {
            // `/form/${item.id}`
            this.editCrawlConfig(item.id)
          },
          iif: () => !this.isEditMode
        },
        {
          text: '编辑',
          // type: 'static', // alain中的static就是不能点击蒙版部分关闭的意思,最好指定component,但此处我们要自己控制modal,所以不用了
          click: (item: any) => {
            this.addEdit(item.id);
          },
          iif: () => this.isEditMode
        },
        {
          text: '删除',
          type: 'del',
          pop: true,
          click: async (item: any) => {
            await this.delete(item.id);
          },
          iif: () => this.isEditMode
        }
      ],
      className: 'text-center'
    }
  ];

  isEditMode: boolean = false;
  isOpenMultiSelect: boolean = false;
  isAutoCreate: boolean = true;
  isAutoFill: boolean = false;
  isAutoSubmit: boolean = false;
  crawlKey: string = '';
  crawlTypeOptions: any[] = [];
  crawlApiUrl: any= null;
  defaultSort: any = null;
  defaultSortOptions: any[] = [];
  isDownloadImage: boolean = false;

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private videoService: VideoService,
    private commonService: CommonService,
    private crawlTypeService: CrawlTypeService,
    private videoQualityService: VideoQualityService,
    private drawer: DrawerHelper,
    private nzModal: NzModalService
  ) {}

  async ngOnInit() {
    // this.searchParam.searchField = this.commonService.searchField;
    this.isAutoFill = this.commonService.isAutoFill;
    this.isAutoSubmit = this.commonService.isAutoSubmit;
    this.isAutoCreate = this.commonService.isAutoCreate;
    this.isEditMode = this.commonService.isEditMode;
    this.isOpenMultiSelect = this.commonService.isOpenMultiSelect;
    this.isDownloadImage = this.commonService.isDownloadImage;
    this.defaultSortOptions = [
      { label: '标题(asc)', value: 'title.ascend' },
      { label: '番号(asc)', value: 'serialNumber.ascend' },
      { label: '更新时间(desc)', value: 'updateTime.descend' },
      { label: '更新时间(asc)', value: 'updateTime.ascend'  },
      { label: '添加时间(desc)', value: 'addTime.descend' },
      { label: '添加时间(asc)', value: 'addTime.ascend' },
      { label: '发行时间(desc)', value: 'publishTime.descend' },
      { label: '发行时间(asc)', value: 'publishTime.ascend' },
    ]
    try {
      let res = (await this.videoQualityService.getDict()) || {};
      if (res) {
        this.qualityTAG = res;
      }
      this.crawlTypeOptions = (await lastValueFrom(this.crawlTypeService.getSelectAll())) || [];
    } catch (e) {
      console.error(e);
    }
  }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoEditComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.videoService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

  async switchAutoCreate() { //有更复杂的逻辑可以另外包在函数里,简单的st操作直接在页面上写就行了
    await this.st.resetColumns()
    this.commonService.isAutoCreate = this.isAutoCreate;
  }

  async switchEditMode() { //有更复杂的逻辑可以另外包在函数里,简单的st操作直接在页面上写就行了
    await this.st.resetColumns()
    this.commonService.isEditMode = this.isEditMode;
  }

  async switchMultiSelect() { //有更复杂的逻辑可以另外包在函数里,简单的st操作直接在页面上写就行了
    await this.st.resetColumns()
    this.commonService.isOpenMultiSelect = this.isOpenMultiSelect;
  }

  switchAutoFill() {
    this.commonService.isAutoFill = this.isAutoFill;
  }

  switchAutoSubmit() {
    this.commonService.isAutoSubmit = this.isAutoSubmit;
  }

  switchDownloadImage() {
    this.commonService.isDownloadImage = this.isDownloadImage;
  }

  async bulkDelete(_data: any) {
    // console.log('_data', _data)
    try {
      // const ids = linq
      //   .from<any>(data)
      //   .where((o) => o.checked)
      //   .select((o) => o.id)
      //   .toArray();
      let ids: number[] = [];
      ids = _data.filter((item: any) => { return  (item.hasOwnProperty('checked') && item.checked) })
                 .map((item: any) => { return item.id })
      if (ids.length > 0) {
        this.nzModal.confirm({
          nzTitle: '确认删除吗？',
          nzOkText: '删除',
          nzOkDanger: true,
          nzOnOk: async () => {
            await this.videoService.bulkDelete(ids);
            this.msgSrv.success('操作成功!');
            this.st.reload();
          },
          nzCancelText: '取消',
          nzOnCancel: () => console.log('Cancel'),
        });
      } else {
        this.msgSrv.error('至少勾选一项');
        return;
      }
    } catch (error) {}
  }

  rowClassName(record: STData, index: number) {
    if (record['existSerialNumber']) {
      return 'sign-tr';
    } else return '';
  }

  getVideoStatus(item: any): number {
    let publishTime = new Date(item.publishTime);
    let today = new Date();
    let onStorage = item.onStorage;
    if (item.onStorage) {
      return 1;
    } else {
      if (dateCompare(today, publishTime) < 0) {
        return 2;
      } else {
        return 3;
      }
    }
  }

  getVideoQuality(item: any): string {
    return item.videoResolution;
  }

  crawlInfo(value: any) {
    console.log(value)
    if (value.hasOwnProperty('crawlKey') && value.hasOwnProperty('crawlApiUrl')) {
      this.drawer.create('爬取信息', VideoManageVideoCrawlInfoComponent, { record: value }, { size: 1600, drawerOptions: { nzClosable: false } }).subscribe(res => {
        if (res.state == 'ok') {
          this.modal.createStatic(VideoManageVideoEditComponent, { record: { id: value.id }, automated: true, automatedData: res.data }).subscribe(res => {
            if (res == 'ok') {
              this.st.reload();
            }
          });
        }
      });
    } else {
      this.msgSrv.info('请配置爬虫关键字与爬虫数据源');
    }
  }

  autoCreate() {
    if (!this.crawlApiUrl) {
      this.msgSrv.info('爬虫类型未设置');
    } else if (!this.crawlKey.trim()) { //涉及输入框的要做trim处理
      this.msgSrv.info('爬虫关键字为空');
    } else {
      let value = {
        id: 0,
        crawlApiUrl: this.crawlApiUrl,
        crawlKey: this.crawlKey
      }
      this.crawlInfo(value)
    }
  }

  async switchVideoSubscription(item: any) {
    try {
      await this.videoService.switchVideoSubscription(item.id)
      item.onSubscription = !item.onSubscription;
    } catch (e) {}
  }

  checkVideoInfo(id: number) {
    this.drawer.create('', VideoManageVideoInfoComponent, { record: { id } }, { size: 1600, footer: false, drawerOptions: { nzPlacement: 'left', nzClosable: false } }).subscribe(res => {
      if (res.state == 'ok') {

      }
    });
  }

  selectDefaultSort() { // sort接口设计的是传null值就不执行
    this.st.reload({ defaultSort: this.defaultSort }, { merge: true, toTop: false })
  }

  editCrawlConfig(id: number) {
    this.modal.createStatic(VideoManageVideoCrawlConfigComponent, { record: { id } }).subscribe(res => {
      if (res == 'ok') {
        this.st.reload(null, { merge: true, toTop: false });
      }
    });
  }

}
