import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { STColumn, STColumnBadge, STColumnTag, STComponent, STData, STPage, STMultiSort } from '@delon/abc/st';
import {SFCheckboxWidgetSchema, SFSchema, SFUISchema, SFSchemaEnumType, SFComponent} from '@delon/form';
import { ModalHelper, _HttpClient, DrawerHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from "ng-zorro-antd/modal";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzImage, NzImageService, NzImagePreviewRef } from 'ng-zorro-antd/image';
import {Subscription} from "rxjs";

import {VideoQualityService} from '../../../../service/video/video-quality.service';
import {VideoService} from '../../../../service/video/video.service';
import {VideoImageDownloadService} from '../../../../service/video/video-image-download.service';
import {CommonService} from '../../../../service/common/common.service';
import {CrawlTypeService} from '../../../../service/crawl/crawl-type.service';
import {VideoManageVideoEditComponent} from '../video-edit/video-edit.component';
import {VideoManageVideoCrawlInfoComponent} from '../video-crawl/video-crawl-info/video-crawl-info.component';
import {VideoManageVideoCrawlConfigComponent} from '../video-crawl/video-crawl-config/video-crawl-config.component';
import {VideoManageVideoInfoComponent} from '../video-info/video-info.component';
import {VideoManageVideoEvaluateComponent} from '../video-evaluate/video-evaluate.component';
import {VideoManageVideoCollectComponent} from '../video-select-album/video-collect.component';

import {dateCompare} from "../../../../shared/utils/dateUtils";
import {lastValueFrom} from "rxjs";
import {CrawlMessage} from "../../../../model/CrawlMessage";

@Component({
  selector: 'app-video-manage-video-list',
  templateUrl: './video-list.component.html',
  styleUrls: ['./video-list.component.less']
})
export class VideoManageVideoListComponent implements OnInit, OnDestroy {
  url = `/api/video/get_by_page`; //?sort=publishTime desc

  page: STPage = {
    showSize: true,
    pageSizes: [10, 20, 30, 40, 50],
    showQuickJumper: true
  };
  searchParam: any = {
    // searchField: null
  }
  compoundKeywordList: any[] = [
    {
      value: ''
    }
  ];
  aa = 'qq'
  onDeleteCompoundKeyword: boolean = false;
  keywordSearchSchema: SFSchema = {
    properties: {
      keyword: {
        type: 'string',
        title: '关键字'
      },
    }
  };
  searchSchema: SFSchema = {
    properties: {
      searchField: {
        type: 'string',
        title: '搜索字段',
        enum: [
          {label: '标题', value: 'title'},
          {label: '番号', value: 'serialNumber'},
          {label: '演员', value: 'starsRaw'},
          {label: '标签', value: 'tagsRaw'},
          {label: '发行时间', value: 'publishTimeStart'},
          {label: '添加时间', value: 'addTimeStart'},
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
      grid: {span: 22},
    },
    $searchField: {
      widget: 'checkbox',
      span: 6, // 指定每一项 8 个单元的布局
      checkAll: true,
      // hidden: this.isSearchKeyword
    },
    $title: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('title') : false},
    },
    $serialNumber: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('serialNumber') : false},
    },
    $starsRaw: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('starsRaw') : false},
    },
    $tagsRaw: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('tagsRaw') : false},
    },
    $publishTimeStart: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('publishTimeStart') : false},
    },
    $addTimeStart: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('addTimeStart') : false},
    },
  };
  statusBADGE: STColumnBadge = {
    1: {text: '已入库', color: 'success'},
    2: {text: '未上架', color: 'warning'},
    3: {text: '未入库', color: 'processing'},
    4: {text: '无资源', color: 'error'},
    5: {text: '默认', color: 'default'}
  };
  qualityTAG: STColumnTag = {
    '1': {text: '成功', color: 'green'},
    '2': {text: '错误', color: 'red'},
    '3': {text: '进行中', color: 'blue'},
    '4': {text: '默认', color: ''},
    '5': {text: '警告', color: 'orange'},
  };
  multiSort: STMultiSort = {
    arrayParam: true
  }
  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    {title: 'ID', index: 'id', type: 'checkbox', iif: () => this.isOpenMultiSelect},
    // { title: '关注', width: 70, render: 'customVideoOnSubscription', className: 'text-center' },
    // { title: '标题', index: 'title', width: 550 },
    {
      title: '标题',
      index: 'title',
      width: 550,
      render: 'customTitle',
    }, //即使是custom render也最好带上index,search和sort什么的用得上
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
    {title: '发行时间', type: 'date', dateFormat: 'yyyy-MM-dd', index: 'publishTime', sort: true},
    {title: '资源状态', render: 'customVideoStatus', className: 'text-center'},
    {title: '订阅', render: 'customSwitchVideoSubscription', className: 'text-center'},
    {title: '评价', render: 'customVideoEvaluate', className: 'text-center'},
    {title: '质量', render: 'customVideoQuality', className: 'text-center'},
    {title: '爬虫', render: 'customVideoInfoCrawlButton', className: 'text-center'},
    // { title: '头像', type: 'img', width: '50px', index: 'avatar' },
    {
      title: '操作',
      width: 160,
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
            await this.deleteVideoLocalImage(item);
          },
          iif: () => this.isEditMode
        },
        {
          text: '收藏',
          click: (item: any) => {
            // `/form/${item.id}`
            this.collectVideo(item.id)
          }
        },
      ],
      className: 'text-center'
    }
  ];

  isEditMode: boolean = false;
  isOpenMultiSelect: boolean = false;
  isAutoCreate: boolean = true;
  isAutoFill: boolean = false;
  isAutoSubmit: boolean = false;
  isKeywordSearch: boolean = true;
  isCompoundKeywordSearch: boolean = false;
  crawlKey: string = '';
  crawlTypeOptions: any[] = [];
  crawlApiUrl: any = null;
  defaultSort: any = null;
  defaultSortOptions: any[] = [];
  isDownloadImage: boolean = false;
  messageSocketSubscription: Subscription = new Subscription();
  reloadSocketSpin: boolean = false;
  scoreTextTable: any = this.commonService.scoreTextTable;

  imagePhysicalPath: string = '';
  imageServerPath: string = '';
  imagePhysicalDirectoryName: string = '';
  imageServerDirectoryName: string = '';

  imageDownloadFinishSubscription: Subscription = new Subscription();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private videoService: VideoService,
    private videoImageDownloadService: VideoImageDownloadService,
    private commonService: CommonService,
    private crawlTypeService: CrawlTypeService,
    private videoQualityService: VideoQualityService,
    private drawer: DrawerHelper,
    private nzModal: NzModalService,
    private ntfService: NzNotificationService,
    private nzImageService: NzImageService,
  ) {
  }

  async ngOnInit() {
    // this.searchParam.searchField = this.commonService.searchField;

    // this.isAutoFill = this.commonService.isAutoFill;
    // this.isAutoSubmit = this.commonService.isAutoSubmit;
    // this.isAutoCreate = this.commonService.isAutoCreate;
    // this.isEditMode = this.commonService.isEditMode;
    // this.isOpenMultiSelect = this.commonService.isOpenMultiSelect;
    // this.isDownloadImage = this.commonService.isDownloadImage;

    this.isAutoFill = this.commonService.globalData.isAutoFill;
    this.isAutoSubmit = this.commonService.globalData.isAutoSubmit;
    this.isAutoCreate = this.commonService.globalData.isAutoCreate;
    this.isEditMode = this.commonService.globalData.isEditMode;
    this.isOpenMultiSelect = this.commonService.globalData.isOpenMultiSelect;
    this.isDownloadImage = this.commonService.globalData.isDownloadImage;
    this.imagePhysicalPath = this.commonService.globalData.imagePhysicalPath
    this.imageServerPath = this.commonService.globalData.imageServerPath
    this.imagePhysicalDirectoryName = this.commonService.globalData.imagePhysicalDirectoryName
    this.imageServerDirectoryName = this.commonService.globalData.imageServerDirectoryName

    this.defaultSortOptions = [
      {label: '标题(asc)', value: 'title.ascend'},
      {label: '标题(desc)', value: 'title.descend'},
      {label: '番号(asc)', value: 'serialNumber.ascend'},
      {label: '番号(desc)', value: 'serialNumber.descend'},
      {label: '更新时间(desc)', value: 'updateTime.descend'},
      {label: '更新时间(asc)', value: 'updateTime.ascend'},
      {label: '添加时间(desc)', value: 'addTime.descend'},
      {label: '添加时间(asc)', value: 'addTime.ascend'},
      {label: '发行时间(desc)', value: 'publishTime.descend'},
      {label: '发行时间(asc)', value: 'publishTime.ascend'},
    ]

    this.imageDownloadFinishSubscription = this.videoImageDownloadService.imageDownloadFinishSubject.subscribe(async (res: any) => {

      if (res.state == 'success') {
        this.st.reload(null, {merge: true, toTop: false});
      }
    })

    try {
      let res = (await this.videoQualityService.getDict()) || {};
      if (res) {
        this.qualityTAG = res;
      }
      this.crawlTypeOptions = (await lastValueFrom(this.crawlTypeService.getSelectAll())) || [];
      this.commonService.createWebSocketSubject('crawlMessageSocketUrl');
      this.connectMessageSocket();
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy() {
    // if (this.messageSocketSubscription) {
    //   this.messageSocketSubscription.unsubscribe();
    // }
    this.imageDownloadFinishSubscription.unsubscribe();
    this.messageSocketSubscription.unsubscribe();
  }

  addEdit(id: number = 0): void {
    this.modal.createStatic(VideoManageVideoEditComponent, {record: {id}}).subscribe(res => {
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

  async deleteVideoLocalImage(item: any) {
    try {
      await this.videoService.deleteVideoLocalImage(item);
      this.msgSrv.success('本地图片删除成功');
    } catch (e) {
      console.error(e);
    }
  }

  async switchAutoCreate() { //有更复杂的逻辑可以另外包在函数里,简单的st操作直接在页面上写就行了
    await this.st.resetColumns()
    this.commonService.globalData.isAutoCreate = this.isAutoCreate;
  }

  async switchEditMode() { //有更复杂的逻辑可以另外包在函数里,简单的st操作直接在页面上写就行了
    await this.st.resetColumns()
    this.commonService.globalData.isEditMode = this.isEditMode;
  }

  async switchMultiSelect() { //有更复杂的逻辑可以另外包在函数里,简单的st操作直接在页面上写就行了
    await this.st.resetColumns()
    this.commonService.globalData.isOpenMultiSelect = this.isOpenMultiSelect;
  }

  switchAutoFill() {
    this.commonService.globalData.isAutoFill = this.isAutoFill;
  }

  switchAutoSubmit() {
    this.commonService.globalData.isAutoSubmit = this.isAutoSubmit;
  }

  switchDownloadImage() {
    this.commonService.globalData.isDownloadImage = this.isDownloadImage;
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
      ids = _data.filter((item: any) => {
        return (item.hasOwnProperty('checked') && item.checked)
      })
        .map((item: any) => {
          return item.id
        })
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
    if (value.hasOwnProperty('crawlApiUrl') && value.hasOwnProperty('crawlKey')) {
      if (this.commonService.globalData.isDownloadImage) {
        if (!(value.hasOwnProperty('imagePhysicalPath') && value.hasOwnProperty('imageServerPath') && value.hasOwnProperty('imagePhysicalDirectoryName') && value.hasOwnProperty('imageServerDirectoryName'))){
          this.msgSrv.info('如果要下载图片,请配置图片相关的文件地址');
          return;
        }
      }
      this.drawer.static('爬取信息', VideoManageVideoCrawlInfoComponent, {record: value}, {
        size: 1600,
        drawerOptions: {nzClosable: false}
      }).subscribe(res => {
        if (res.state == 'ok') {
          this.modal.createStatic(VideoManageVideoEditComponent, {
            record: {id: value.id},
            automated: true,
            automatedData: res.data
          }).subscribe(res => {
            if (res == 'ok') {
              this.st.reload();
            }
          });
        }
      });
    } else {
      this.msgSrv.info('请配置爬虫数据源与爬虫关键字');
    }
  }

  autoCreate() {
    console.log('此处')
    if (!this.crawlApiUrl) {
      this.msgSrv.info('爬虫类型未设置');
    } else if (!this.crawlKey.trim()) { //涉及输入框的要做trim处理
      this.msgSrv.info('爬虫关键字为空');
    } else {
      let value = {
        id: 0,
        crawlApiUrl: this.crawlApiUrl,
        crawlKey: this.crawlKey,
        imagePhysicalPath: this.imagePhysicalPath,
        imageServerPath: this.imageServerPath,
        imagePhysicalDirectoryName: this.imagePhysicalDirectoryName,
        imageServerDirectoryName: this.imageServerDirectoryName
      }
      this.crawlInfo(value)
    }
  }

  async switchVideoSubscription(item: any) {
    try {
      await this.videoService.switchVideoSubscription(item.id)
      item.onSubscription = !item.onSubscription;
    } catch (e) {
    }
  }

  checkVideoInfo(id: number) {
    this.drawer.create('', VideoManageVideoInfoComponent, {record: {id}}, {
      size: 1600,
      footer: false,
      drawerOptions: {nzPlacement: 'left', nzClosable: false}
    }).subscribe(res => {
      if (res.state == 'ok') {

      }
    });
  }

  selectDefaultSort() { // sort接口设计的是传null值就不执行
    this.st.reload({defaultSort: this.defaultSort}, {merge: true, toTop: false})
  }

  editCrawlConfig(id: number) {
    let autoCreateConfig: any = {
      canCrawl: true,
      crawlKey: this.crawlKey,
      crawlApiUrl: this.crawlApiUrl,
      imagePhysicalPath: this.imagePhysicalPath,
      imageServerPath: this.imageServerPath,
      imagePhysicalDirectoryName: this.imagePhysicalDirectoryName,
      imageServerDirectoryName: this.imageServerDirectoryName,
    }
    this.modal.createStatic(VideoManageVideoCrawlConfigComponent, {record: {id}, autoCreateConfig }).subscribe(res => {
      if (res.state == 'updateOk') {
        this.st.reload(null, {merge: true, toTop: false});
      } else if (res.state == 'configOk') {
          this.crawlKey = res.data.crawlKey
          this.crawlApiUrl = res.data.crawlApiUrl
          this.imagePhysicalPath = res.data.imagePhysicalPath
          this.imageServerPath = res.data.imageServerPath
          this.imagePhysicalDirectoryName = res.data.imagePhysicalDirectoryName
          this.imageServerDirectoryName = res.data.imageServerDirectoryName
      }
    });
  }

  connectMessageSocket() {
    this.reloadSocketSpin = true;
    if (!this.messageSocketSubscription.closed) {
      this.messageSocketSubscription.unsubscribe();
    }
    this.messageSocketSubscription = this.commonService.socket$.subscribe((res: CrawlMessage) => { //这里只要subscribe就行,有错误处理函数
      let picType = ''
      switch (res.msgType) {
        case 'cover':
          picType = '封面图'
          break;
        case 'preview':
          picType = '预览图'
          break;
        default:
          break;
      }
      let ntfTitle = `${picType}下载成功: ${res.index}/${res.total}`
      this.ntfService.success(ntfTitle, res.message, {
        nzKey: 'messageSocket'
      })
    })
    setTimeout(() => {
      this.reloadSocketSpin = false;
    }, 500);
  }

  openVideoEvaluate(id: number) {
    this.modal.createStatic(VideoManageVideoEvaluateComponent, {record: {id}}).subscribe(res => {
      if (res == 'ok') {
        this.st.reload(null, {merge: true, toTop: false});
      }
    });
  }

  getScoreText(score: number) {
    if (!Number.isFinite(score)) {
      return {text: '评分异常', status: false};
    }
    if (score < 1 || score > 10) {
      return {text: '评分异常', status: false};
    }
    return this.scoreTextTable[score];
  }

  previewVideoImage(item: any) {
    // const images = [
    //   {
    //     src: 'https://img.alicdn.com/tfs/TB1g.mWZAL0gK0jSZFtXXXQCXXa-200-200.svg',
    //     width: '200px',
    //     height: '200px',
    //     alt: 'ng-zorro'
    //   },
    //   {
    //     src: 'https://img.alicdn.com/tfs/TB1Z0PywTtYBeNjy1XdXXXXyVXa-186-200.svg',
    //     width: '200px',
    //     height: '200px',
    //     alt: 'angular'
    //   }
    // ];
    const images: NzImage[] = [];
    images.push({
      src: item.localCoverSrc ? item.imageServerPath + '/' + item.imageServerDirectoryName + '/' + item.localCoverSrc : '',
      width: '1000px',
      alt: item.title ? item.title : ''
    })
    if (Array.isArray(item.localPreviewImageSrcList)) {
      let lpisl = item.localPreviewImageSrcList
      for (let i=0; i < lpisl.length; i++) {
        images.push({
          src: item.imageServerPath + '/' + item.imageServerDirectoryName + '/' + lpisl[i],
          alt: item.title ? item.title : ''
        })
      }
    }
    this.nzImageService.preview(images, { nzKeyboard: true, nzMaskClosable: true, nzCloseOnNavigation: true})
  }

  collectVideo(id: number) {
    this.modal.createStatic(VideoManageVideoCollectComponent, {record: {id}}).subscribe(res => {
      if (res == 'ok') {
        this.st.reload(null, {merge: true, toTop: false});
      }
    });
  }

  searchCompoundKeyword() {
    let params = this.compoundKeywordList.filter((item: any) => item.value).map((item: any) => item.value);
    console.log(params)
    this.st.reset({ compoundKeyword: params });
  }

  deleteCompoundKeyword(index: number) {
    if (this.compoundKeywordList.length > 1) {
      this.compoundKeywordList.splice(index, 1);
    }
  }

}
