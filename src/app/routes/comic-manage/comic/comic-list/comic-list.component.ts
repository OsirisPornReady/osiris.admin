import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { STColumn, STColumnBadge, STColumnTag, STComponent, STData, STPage, STMultiSort } from '@delon/abc/st';
import {SFCheckboxWidgetSchema, SFSchema, SFUISchema, SFSchemaEnumType, SFComponent} from '@delon/form';
import { ModalHelper, _HttpClient, DrawerHelper } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from "ng-zorro-antd/modal";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzImage, NzImageService, NzImagePreviewRef } from 'ng-zorro-antd/image';
import {finalize, Subscription} from "rxjs";

import {ComicService} from '../../../../service/comic/comic.service';
import {ComicDownloadService} from '../../../../service/comic/comic-download.service';
import {CommonService} from '../../../../service/common/common.service';
import {CrawlTypeService} from '../../../../service/crawl/crawl-type.service';
import {ComicManageComicEditComponent} from '../comic-edit/comic-edit.component';
import {ComicManageComicCrawlConfigComponent} from '../comic-crawl/comic-crawl-config/comic-crawl-config.component';
import {ComicManageComicInfoComponent} from '../comic-info/comic-info.component';
import {ComicManageComicEvaluateComponent} from '../comic-evaluate/comic-evaluate.component';
import {ComicManageComicDownloadConfigComponent} from '../comic-download-config/comic-download-config.component';

// import {VideoManageVideoCollectComponent} from '../video-select-album/video-collect.component';

import {dateCompare} from "../../../../shared/utils/dateUtils";
import {lastValueFrom} from "rxjs";
import {CrawlMessage} from "../../../../model/CrawlMessage";
import {ComicManageComicCrawlInfoComponent} from "../comic-crawl/comic-crawl-info/comic-crawl-info.component";


@Component({
  selector: 'app-comic-manage-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.less']
})
export class ComicManageComicListComponent implements OnInit, OnDestroy {
  url = `/api/comic/get_by_page`; //?sort=postedTime desc

  page: STPage = {
    showSize: true,
    pageSizes: [10, 20, 30, 40, 50],
    showQuickJumper: true
  };
  searchParam: any = {
    // searchField: null
  }
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
          {label: '日文标题', value: 'titleJap'},
          {label: '语言', value: 'languageTags'},
          {label: '同人原作', value: 'parodyTags'},
          {label: '角色', value: 'characterTags'},
          {label: '创作团体', value: 'groupTags'},
          {label: '创作者', value: 'artistTags'},
          {label: '男性标签', value: 'maleTags'},
          {label: '女性标签', value: 'femaleTags'},
          {label: '混合标签', value: 'mixedTags'},
          {label: '其他标签', value: 'otherTags'},
          {label: '发行时间', value: 'postedTimeStart'},
          {label: '添加时间', value: 'addTimeStart'},
        ],
        default: ['title']
      },
      title: {
        type: 'string',
        title: '标题'
      },
      titleJap: {
        type: 'string',
        title: '日文标题'
      },
      languageTags: {
        type: 'string',
        title: '语言'
      },
      parodyTags: {
        type: 'string',
        title: '同人原作'
      },
      characterTags: {
        type: 'string',
        title: '角色'
      },
      groupTags: {
        type: 'string',
        title: '创作团体'
      },
      artistTags: {
        type: 'string',
        title: '创作者'
      },
      maleTags: {
        type: 'string',
        title: '男性标签'
      },
      femaleTags: {
        type: 'string',
        title: '女性标签'
      },
      mixedTags: {
        type: 'string',
        title: '混合标签'
      },
      otherTags: {
        type: 'string',
        title: '其他标签'
      },
      postedTimeStart: {
        type: 'string',
        title: '发行时间',
        ui: {
          widget: 'date',
          rangeMode: 'date',
          end: 'postedTimeEnd',
          format: 'yyyy-MM-dd',
        },
      },
      postedTimeEnd: {
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
    $titleJap: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('titleJap') : false},
    },
    $languageTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('languageTags') : false},
    },
    $parodyTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('parodyTags') : false},
    },
    $characterTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('characterTags') : false},
    },
    $groupTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('groupTags') : false},
    },
    $artistTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('artistTags') : false},
    },
    $maleTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('maleTags') : false},
    },
    $femaleTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('femaleTags') : false},
    },
    $mixedTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('mixedTags') : false},
    },
    $otherTags: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('otherTags') : false},
    },
    $postedTimeStart: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('postedTimeStart') : false},
    },
    $addTimeStart: {
      visibleIf: {searchField: value => Array.isArray(value) ? value.includes('addTimeStart') : false},
    },
  };
  statusBADGE: STColumnBadge = {
    1: {text: '已入库', color: 'success'},
    2: {text: '有缺失页', color: 'warning'},
    3: {text: '有种子', color: 'processing'},
    4: {text: '无种子', color: 'error'},
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
    {
      title: '标题',
      index: 'title',
      width: 550,
      render: 'customTitle',
    }, //即使是custom render也最好带上index,search和sort什么的用得上
    {title: '页数', index: 'pageSize', sort: true, className: 'text-left'},
    {title: '发行时间', type: 'date', dateFormat: 'yyyy-MM-dd', index: 'postedTime', sort: true},
    {title: '资源状态', render: 'customComicStatus', className: 'text-center'},
    {title: '种子状态', index: 'existSeed', type: 'yn', className: 'text-center'},
    {title: '下载', render: 'customDownloadComic', className: 'text-center'},
    {title: '评价', render: 'customComicEvaluate', className: 'text-center'},
    {title: '爬虫', render: 'customComicInfoCrawlButton', className: 'text-center'},
    {
      title: '操作',
      width: 160,
      buttons: [
        {
          text: '查看',
          click: (item: any) => {
            // `/form/${item.id}`
            this.checkComicInfo(item.id)
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
  crawlKey: string = '';
  crawlTypeOptions: any[] = [];
  crawlApiUrl: any = null;
  defaultSort: any = null;
  defaultSortOptions: any[] = [];
  isDownloadImage: boolean = false;
  messageSocketSubscription: Subscription = new Subscription();
  reloadSocketSpin: boolean = false;
  scoreTextTable: any = this.commonService.scoreTextTable;
  onDownloadingComic: boolean = false;
  comicIdOnDownloading: number[] = [];

  comicPhysicalPath: string = '';
  comicServerPath: string = '';
  comicPhysicalDirectoryName: string = '';
  comicServerDirectoryName: string = '';

  onlyCrawlInfo: boolean = false;

  downloadFinishSubscription: Subscription = new Subscription();

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private comicService: ComicService,
    private comicDownloadService: ComicDownloadService,
    private commonService: CommonService,
    private crawlTypeService: CrawlTypeService,
    private drawer: DrawerHelper,
    private nzModal: NzModalService,
    private ntfService: NzNotificationService,
    private nzImageService: NzImageService
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
    this.comicPhysicalPath = this.commonService.globalData.comicPhysicalPath
    this.comicServerPath = this.commonService.globalData.comicServerPath
    this.comicPhysicalDirectoryName = this.commonService.globalData.comicPhysicalDirectoryName
    this.comicServerDirectoryName = this.commonService.globalData.comicServerDirectoryName

    this.defaultSortOptions = [
      {label: '标题(asc)', value: 'title.ascend'},
      {label: '标题(desc)', value: 'title.descend'},
      {label: '日文标题(asc)', value: 'titleJap.ascend'},
      {label: '日文标题(desc)', value: 'titleJap.descend'},
      {label: '更新时间(desc)', value: 'updateTime.descend'},
      {label: '更新时间(asc)', value: 'updateTime.ascend'},
      {label: '添加时间(desc)', value: 'addTime.descend'},
      {label: '添加时间(asc)', value: 'addTime.ascend'},
      {label: '发行时间(desc)', value: 'postedTime.descend'},
      {label: '发行时间(asc)', value: 'postedTime.ascend'},
    ]

    this.downloadFinishSubscription = this.comicDownloadService.downloadFinishSubject.subscribe(async (res: any) => {
      this.comicIdOnDownloading = this.comicIdOnDownloading.filter((id: number) => {
        return id != res.id;
      })
      this.onDownloadingComic = this.comicIdOnDownloading.length != 0;
      if (res.update) {
        this.st.reload(null, {merge: true, toTop: false});
      }
    })

    this.comicIdOnDownloading = Array.from(this.comicDownloadService.downloadMissionMap.keys())
    this.onDownloadingComic = this.comicIdOnDownloading.length != 0;

    try {
      this.crawlTypeOptions = (await lastValueFrom(this.crawlTypeService.getSelectAll())) || [];
      this.commonService.createWebSocketSubject('crawlMessageSocketUrl');
      this.connectMessageSocket();
    } catch (e) {
      console.error(e);
    }
  }

  ngOnDestroy() {
    if (this.messageSocketSubscription) {
      this.messageSocketSubscription.unsubscribe();
    }
  }

  addEdit(id: number = 0): void {
    this.modal.createStatic(ComicManageComicEditComponent, {record: {id}}).subscribe(res => {
      if (res == 'ok') {
        this.st.reload();
      }
    });
  }

  async delete(id: number = 0) {
    try {
      await this.comicService.delete(id);
      this.msgSrv.success('删除成功');
      this.st.reload();
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
            await this.comicService.bulkDelete(ids);
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
    } catch (error) {
    }
  }

  rowClassName(record: STData, index: number) {
    if (record['existSerialNumber']) {
      return 'sign-tr';
    } else return '';
  }

  getComicStatus(item: any): number {
    let onStorage = item.onStorage;
    let existSeed = item.existSeed;
    if (item.comicFailOrderList.filter((i: any) => i != '-').length == 0 && onStorage) {
      return 1;
    } else {
      if (onStorage) {
        return 2;
      } else {
        if (existSeed) {
          return 3;
        } else {
          return 4;
        }
      }
    }
  }

  crawlInfo(value: any) {
    if (value.hasOwnProperty('crawlApiUrl') && value.hasOwnProperty('crawlKey')) {
      if (this.commonService.globalData.isDownloadImage) {
        if (!(value.hasOwnProperty('comicPhysicalPath') && value.hasOwnProperty('comicServerPath') && value.hasOwnProperty('comicPhysicalDirectoryName') && value.hasOwnProperty('comicServerDirectoryName'))){
          this.msgSrv.info('如果要下载图片,请配置图片相关的文件地址');
          return;
        }
      }
      this.drawer.create('爬取信息', ComicManageComicCrawlInfoComponent, {record: value}, {
        size: 1600,
        drawerOptions: {nzClosable: false}
      }).subscribe(res => {
        if (res.state == 'ok') {
          this.modal.createStatic(ComicManageComicEditComponent, {
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
    if (!this.crawlApiUrl) {
      this.msgSrv.info('爬虫类型未设置');
    } else if (!this.crawlKey.trim()) { //涉及输入框的要做trim处理
      this.msgSrv.info('爬虫关键字为空');
    } else {
      let value = {
        id: 0,
        crawlApiUrl: this.crawlApiUrl,
        crawlKey: this.crawlKey,
        comicPhysicalPath: this.comicPhysicalPath,
        comicServerPath: this.comicServerPath,
        comicPhysicalDirectoryName: this.comicPhysicalDirectoryName,
        comicServerDirectoryName: this.comicServerDirectoryName,
        onlyCrawlInfo: this.onlyCrawlInfo
      }
      this.crawlInfo(value)
    }
  }

  checkComicInfo(id: number) {
    this.drawer.create('', ComicManageComicInfoComponent, {record: {id}}, {
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
      comicPhysicalPath: this.comicPhysicalPath,
      comicServerPath: this.comicServerPath,
      comicPhysicalDirectoryName: this.comicPhysicalDirectoryName,
      comicServerDirectoryName: this.comicServerDirectoryName,
    }
    this.modal.createStatic(ComicManageComicCrawlConfigComponent, {record: {id}, autoCreateConfig}).subscribe(res => {
      if (res.state == 'updateOk') {
        this.st.reload(null, {merge: true, toTop: false});
      } else if (res.state == 'configOk') {
        this.crawlKey = res.data.crawlKey
        this.crawlApiUrl = res.data.crawlApiUrl
        this.comicPhysicalPath = res.data.comicPhysicalPath
        this.comicServerPath = res.data.comicServerPath
        this.comicPhysicalDirectoryName = res.data.comicPhysicalDirectoryName
        this.comicServerDirectoryName = res.data.comicServerDirectoryName
        this.onlyCrawlInfo = res.onlyCrawlInfo
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
        case 'comic':
          picType = '漫画'
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

  openComicEvaluate(id: number) {
    this.modal.createStatic(ComicManageComicEvaluateComponent, {record: {id}}).subscribe(res => {
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

  previewComicImage(item: any) {
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
      src: item.localCoverSrc ? item.comicServerPath + '/' + item.comicServerDirectoryName + '/' + item.localCoverSrc : '',
      height: '700px',
      alt: item.title ? item.title : ''
    })
    if (Array.isArray(item.localComicPicSrcList)) {
      let lpisl = item.localComicPicSrcList
      for (let i=0; i < lpisl.length; i++) {
        images.push({
          src: item.comicServerPath + '/' + item.comicServerDirectoryName + '/' + lpisl[i],
          alt: item.title ? item.title : ''
        })
      }
    }
    this.nzImageService.preview(images, { nzKeyboard: true, nzMaskClosable: true, nzCloseOnNavigation: true})
  }

  collectVideo(id: number) {
    // this.modal.createStatic(VideoManageVideoCollectComponent, {record: {id}}).subscribe(res => {
    //   if (res == 'ok') {
    //     this.st.reload(null, {merge: true, toTop: false});
    //   }
    // });
  }

  downloadComic(item: any) {
    // if (this.onDownloadingComic) {
    //   this.msgSrv.info('正在下载其他漫画');
    //   return;
    // }
    if (this.onDownloadingComic && this.comicIdOnDownloading.includes(item.id)) {
      let mission: any = this.comicDownloadService.downloadMissionMap.get(item.id)
      if (mission) {
        mission.subscription.unsubscribe();
        return;
      }
    }
    if (!(item.hasOwnProperty('secureFileName') && item.secureFileName)) {
      this.msgSrv.info('还未爬取信息');
      return;
    }
    this.modal.createStatic(ComicManageComicDownloadConfigComponent, {record: { id: item.id }}, { size: 'xl' }).subscribe(res => {
      if (res.state == 'ok') {
        this.onDownloadingComic = true;
        this.comicIdOnDownloading.push(item.id);

        let taskInfo: any = {
          id: item.id,
          comicPhysicalPath: item.comicPhysicalPath,
          comicServerPath: item.comicServerPath,
          comicPhysicalDirectoryName: item.comicPhysicalDirectoryName,
          comicServerDirectoryName: item.comicServerDirectoryName,
          comicPicLinkList: item.comicPicLinkList ? item.comicPicLinkList : [],
          localComicPicSrcList: item.localComicPicSrcList ? item.localComicPicSrcList : [],
          comicFailOrderList: item.comicFailOrderList ? item.comicFailOrderList : [],
          pageList: res.data.downloadPageList
        }

        // let entity: any = {
        //   comicPhysicalPath: item.comicPhysicalPath,
        //   comicServerPath: item.comicServerPath,
        //   comicPhysicalDirectoryName: item.comicPhysicalDirectoryName,
        //   comicServerDirectoryName: item.comicServerDirectoryName,
        //   comicPicLinkList: item.comicPicLinkList ? item.comicPicLinkList : [],
        //   localComicPicSrcList: item.localComicPicSrcList ? item.localComicPicSrcList : [],
        //   comicFailOrderList: item.comicFailOrderList ? item.comicFailOrderList : [],
        //   downloadPageList: res.data.downloadPageList
        // }
        // let url = `crawl/comic/download_comic/${item.id}`
        // let subscription: Subscription = this.http.post(url, entity).pipe(finalize(() => {
        //   this.onDownloadingComic = false;
        //   this.comicIdOnDownloading = [];
        //   this.http.get(`crawl/comic/cancel_download/${item.id}`);
        // })).subscribe({
        //   next: async (res: any) => {
        //     this.msgSrv.success('Comic下载成功');
        //     try {
        //       await this.comicService.update({
        //         id: item.id,
        //         localComicPicSrcList: res?.localComicPicSrcList,
        //         comicFailOrderList: res?.comicFailOrderList,
        //         onStorage: true
        //       });
        //       this.st.reload(null, {merge: true, toTop: false});
        //       this.comicDownloadService.downloadFinishSubject.next({
        //         id: item.id,
        //         update: true
        //       });
        //       this.msgSrv.success('Comic数据更新成功');
        //     } catch (e) {
        //       this.msgSrv.error('Comic数据更新失败');
        //     }
        //   },
        //   error:async () => {
        //     this.msgSrv.error('Comic下载失败');
        //     try {
        //       await this.comicService.update({
        //         id: item.id,
        //         onStorage: false
        //       });
        //       this.st.reload(null, {merge: true, toTop: false});
        //       this.comicDownloadService.downloadFinishSubject.next({
        //         id: item.id,
        //         update: true
        //       });
        //       this.msgSrv.info('Comic入库状态更新');
        //     } catch (e) {
        //       this.msgSrv.error('Comic数据更新失败');
        //     }
        //   },
        //   complete: () => {}
        // })
        // this.comicDownloadService.downloadMissionMap.set(item.id, {
        //   id: item.id,
        //   subscription: subscription,
        //   pageList: res.data.downloadPageList,
        // });

        this.comicDownloadService.createDownloadTask(taskInfo);
      }
    });
  }

  checkComicSeed(item: any) {
    // this.nzModal.confirm({
    //   nzTitle: '<i>已有种子,是否直接跳转至E站</i>',
    //   nzContent: '<b>有种子建议直接下载,不太建议爬取</b>',
    //   nzOkText: '跳转E站',
    //   nzCancelText: '继续下载',
    //   nzOnOk: () => {
    //     this.commonService.openNewTab(item.dataSourceUrl);
    //   },
    //   nzOnCancel: () => {
    //     this.downloadComic(item);
    //   }
    // })
    if (item.existSeed) {

    }
  }

  gotoDataSourceUrl(item: any) {
    this.commonService.openNewTab(item.dataSourceUrl);
  }

}
