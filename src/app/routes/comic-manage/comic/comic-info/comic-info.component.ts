import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SFComponent, SFSchema, SFUISchema } from '@delon/form';
import {_HttpClient, ModalHelper} from '@delon/theme';
import {STChange, STColumn, STColumnTag, STComponent, STData, STPage} from "@delon/abc/st";
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NzMessageService } from 'ng-zorro-antd/message';
import {NzUploadFile} from "ng-zorro-antd/upload";
import { NzImage, NzImageService, NzImagePreviewRef } from 'ng-zorro-antd/image';
import {catchError, finalize, fromEvent, Subscription} from "rxjs";

import { ComicService } from '../../../../service/comic/comic.service';
import { ComicDownloadService } from '../../../../service/comic/comic-download.service';
import { CommonService } from '../../../../service/common/common.service';
import { CrawlService } from '../../../../service/crawl/crawl.service';

import {ComicManageLocalComicEditComponent} from "../local-comic-edit/local-comic-edit.component";

import { dateStringFormatter } from "../../../../shared/utils/dateUtils";
import { fallbackImageBase64 } from "../../../../../assets/image-base64";
import { environment } from "@env/environment";


@Component({
  selector: 'app-comic-manage-comic-info',
  templateUrl: './comic-info.component.html',
  styleUrls: ['/comic-info.component.less']
})
export class ComicManageComicInfoComponent implements OnInit, OnDestroy {
  protected readonly fallbackImageBase64 = fallbackImageBase64;
  comicUploadUrl: string = environment['comicUploadUrl'];

  scoreTextList: string[] = this.commonService.scoreTextList;

  title = '';
  record: any = {};
  i: any;
  ei: any;
  @ViewChild('sf') sf!: SFComponent;
  @ViewChild('evaluateSf') evaluateSf!: SFComponent;
  @ViewChild('uploadComicPathSF') uploadComicPathSF!: SFComponent;
  schema: SFSchema = {
    properties: {
      title: { type: 'string', title: '标题' },
      titleJap: { type: 'string', title: '日文标题' },
      secureFileName: { type: 'string', title: '安全的文件名' },
      existSeed: { type: 'boolean', title: '是否有种子' },
      pageSize: { type: 'number', title: '页数' },
      languageTags: { type: 'string', title: '语言' },
      parodyTags: { type: 'string', title: '同人原作' },
      characterTags: { type: 'string', title: '角色' },
      groupTags: { type: 'string', title: '创作团体' },
      artistTags: { type: 'string', title: '创作者' },
      maleTags: { type: 'string', title: '男性标签' },
      femaleTags: { type: 'string', title: '女性标签' },
      mixedTags: { type: 'string', title: '混合标签' },
      otherTags: { type: 'string', title: '其他标签' },
      comicPhysicalPath: { type: 'string', title: '物理地址' },
      comicServerPath: { type: 'string', title: '服务器地址' },
      comicPhysicalDirectoryName: { type: 'string', title: '物理文件夹名' },
      comicServerDirectoryName: { type: 'string', title: '服务器文件夹名' },
      // coverSrc: { type: 'string', title: '封面' },
      // previewImageSrcList: { type: 'string', title: '预览图' },
      coverBase64: { type: 'string', title: '封面Base64' },
      localCoverSrc: { type: 'string', title: '本地封面' },
      localPreviewImageSrcList: { type: 'string', title: '本地预览图' },
      comicPicLinkList: { type: 'string', title: '漫画链接' },
      comicFailOrderList: { type: 'string', title: '缺失图片序号(从1开始)' },
      localComicPicSrcList: { type: 'string', title: '本地漫画链接' },
    },
    required: ['title'],
  };
  evaluateSchema: SFSchema = {
    properties: {
      score: { type: 'number', title: '评分', maximum: 10, multipleOf: 1 },
      comment: { type: 'string', title: '评价' },
    },
    required: [],
  };
  uploadSchema: SFSchema = {
    properties: {
      uploadDir: {
        type: 'string', title: '导入方式',
        ui: {
          widget: 'custom'
        }
      },
      title: { type: 'string', title: '标题' },
      comicPhysicalPath: { type: 'string', title: '物理地址' },
      comicServerPath: { type: 'string', title: '服务器地址' },
      comicPhysicalDirectoryName: { type: 'string', title: '物理文件夹名' },
      comicServerDirectoryName: { type: 'string', title: '服务器文件夹名' },
      remark: { type: 'string', title: '备注' }
    },
    required: ['title', 'comicPhysicalPath','comicServerPath','comicPhysicalDirectoryName','comicServerDirectoryName'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 145,
      grid: { span: 22 }
    },
    $title: { placeholder: '输入标题' },
    $titleJap: { placeholder: '输入日文标题' },
    $score: {
      // widget: 'custom'
      widget: 'rate',
      text: ` {{value}} 分`,
      tooltips: this.scoreTextList,
    },
    $comment: {
      widget: 'textarea'
    },
    $pageSize: {
      unit: '页',
      widgetWidth: 150,
      precision: 0
    },
    $languageTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加语言',
      mode: 'tags',
      default: null,
    },
    $parodyTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加同人原作',
      mode: 'tags',
      default: null,
    },
    $characterTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加角色',
      mode: 'tags',
      default: null,
    },
    $groupTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加创作团体',
      mode: 'tags',
      default: null,
    },
    $artistTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加创作者',
      mode: 'tags',
      default: null,
    },
    $maleTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加男性标签',
      mode: 'tags',
      default: null,
    },
    $femaleTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加女性标签',
      mode: 'tags',
      default: null,
    },
    $mixedTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加混合标签',
      mode: 'tags',
      default: null,
    },
    $otherTags: {
      widget: 'select',
      allowClear: true,
      placeholder: '请添加其他标签',
      mode: 'tags',
      default: null,
    },
    $previewImageSrcList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入预览图(可多个值)',
      mode: 'tags',
      default: null,
    },
    $localPreviewImageSrcList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入本地预览图(可多个值)',
      mode: 'tags',
      default: null,
    },
    $comicPicLinkList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入图(可多个值)',
      mode: 'tags',
      default: null,
    },
    $comicFailOrderList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入图(可多个值)',
      mode: 'tags',
      default: null,
    },
    $localComicPicSrcList: {
      widget: 'select',
      allowClear: true,
      placeholder: '输入图(可多个值)',
      mode: 'tags',
      default: null,
    },
  };


  comicPageList: STData[] = []
  allChecked: boolean = false;
  indeterminate: boolean = false;
  TAG: STColumnTag = {
    true: { text: '已下载', color: 'green' },
    false: { text: '未下载', color: 'red' },
  };
  page: STPage = {
    showSize: true,
    pageSizes: [10, 20, 30, 40, 50],
    showQuickJumper: true
  };
  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    {
      title: '',
      index: 'pageIndex',
      width: 50,
      render: 'customCheck'
    },
    {
      title: '名字',
      index: 'pageName',
      width: 120,
      className: 'text-center',
    }, //即使是custom render也最好带上index,search和sort什么的用得上
    {
      title: '状态',
      index: 'pageStatus',
      width: 120,
      type: 'tag',
      tag: this.TAG,
      sort: true,
      className: 'text-center'
    },
    {
      title: '链接',
      index: 'pageLink',
      render: 'customPageLink',
    },
    {
      title: '下载',
      width: 120,
      render: 'customPageDownload',
      className: 'text-center'
    },
    {
      title: '操作',
      width: 160,
      buttons: [
        {
          text: '验证',
          click: async (item: any) => {
            await this.checkLocalExhentaiComicPages(this.i, [item.pageIndex])
          },
        },
        {
          text: '预览',
          click: (item: any) => {
            this.previewComicImage(item)
          },
        }
      ],
      className: 'text-center'
    }
  ];

  protected readonly dateStringFormatter = dateStringFormatter;
  coverSrc: string = ''
  javUrl: string = ''
  btdigUrl: string = ''
  nyaaUrl: string = ''
  dataSourceUrl: string = ''
  comicImageSrcList: string[] = [];
  enterKeyDownSubscription: any = null;
  spaceKeyDownSubscription: any = null;
  dKeyDownSubscription: any = null;
  score: number = 0;
  comment: string = '';

  onDownloadingPage: boolean = false;
  pageIndexOnDownloading: number[] = [];

  downloadFinishSubscription: Subscription = new Subscription();
  downloadSubscription: Subscription = new Subscription();

  failPageSize: number = 0;

  //本地上传相关
  comicFileList: NzUploadFile[] = [];
  comicFilePathInfo: any = { uploadDir: true }
  comicUploadSuccess: boolean = false;
  uploadDir: boolean = true;
  localComicList: any[] = [];
  submitLocalComicLoading: boolean = false;

  previewOptions: any[] = [];
  currentPreview: number = 0;
  currentComicData: any = null;

  constructor(
    private drawer: NzDrawerRef,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private nzImageService: NzImageService,
    public http: _HttpClient,
    private comicService: ComicService,
    private comicDownloadService: ComicDownloadService,
    private commonService: CommonService,
    private crawlService: CrawlService
  ) {}

  async ngOnInit() {
    this.downloadFinishSubscription = this.comicDownloadService.downloadFinishSubject.subscribe(async (res: any) => {
      if (res.id == this.record.id) {
        this.onDownloadingPage = false;
        this.pageIndexOnDownloading = [];
        // subscription就没必要手动取消,会走到这个函数本身就代表订阅流已经完成了,不管是以success、error还是手动unsubscribe的方式
        // 2023-5-29: 不应该在这里删除map,应该直接在finalize里,下载完成的时候不一定正好在组件开启期间
        // 2023-5-29: 也不应该在finalize里删除,finalize里是镜像源,应该在app全局挂载这个订阅
        // if (this.comicDownloadService.downloadMissionMap.has(this.record.id)) {  //不管是什么原因结束,结束了就把暂存的下载标识删掉
        //   this.comicDownloadService.downloadMissionMap.delete(this.record.id);
        // }
        if (res.update) {
          await this.getComicData();
          this.st.reload(null, {merge: true, toTop: false});
        }
      }
    })
    if (this.comicDownloadService.downloadMissionMap.has(this.record.id)) {
      let mission: any = this.comicDownloadService.downloadMissionMap.get(this.record.id);
      if (mission) {
        this.onDownloadingPage = true;
        this.pageIndexOnDownloading = mission.pageList;
        this.downloadSubscription = mission.subscription;
      }
    }
    await this.getComicData();
    await this.getLocalComicListByComicId();
  }

  async getComicData() {
    try {
      let res = (await this.comicService.getById(this.record.id)) || {}
      this.i = res
      this.ei = {
        id: res?.id,
        score: res?.score,
        comment: res?.comment
      }

      this.dataSourceUrl = this.i.dataSourceUrl

      this.javUrl = this.commonService.buildJavbusLink(this.i.crawlKey)
      this.btdigUrl = this.commonService.buildBtdiggLink(this.i.crawlKey)
      this.nyaaUrl = this.commonService.buildNyaaLink(this.i.crawlKey)
      this.comicImageSrcList = Array.isArray(this.i.localComicPicSrcList) ? this.i.localComicPicSrcList : []
      this.currentComicData = this.i

      this.failPageSize = this.i.comicFailOrderList.filter((rr: any) => rr != '-').length;

      this.getComicPageList();
    } catch (error) {
      console.error(error)
      this.msgSrv.error('读取信息失败')
      this.close();
    }
  }

  async evaluate(value: any) {
    try {
      await this.comicService.update(value);
      this.msgSrv.success('评分评价保存成功');
    } catch (error) {}
  }

  async save(value: any) {
    try {
      this.drawer.close({ state: 'ok', data: value });
    } catch (error) {}
  }

  close(): void {
    this.drawer.close({ state: 'cancel', data: {} });
  }

  ngOnDestroy() {
    // this.coverSrc = ''
    // if (this.enterKeyDownSubscription) {
    //   this.enterKeyDownSubscription.unsubscribe();
    // }
    // if (this.spaceKeyDownSubscription) {
    //   this.spaceKeyDownSubscription.unsubscribe();
    // }
    // if (this.dKeyDownSubscription) {
    //   this.dKeyDownSubscription.unsubscribe();
    // }
    this.downloadFinishSubscription.unsubscribe();
  }

  getComicPageList() {
    if (this.i.hasOwnProperty('comicPicLinkList') &&
        Array.isArray(this.i.comicPicLinkList) &&
        this.i.hasOwnProperty('comicFailOrderList') &&
        Array.isArray(this.i.comicFailOrderList) &&
        this.i.hasOwnProperty('comicPicLinkList') &&
        Array.isArray(this.i.comicPicLinkList) &&
        this.i.hasOwnProperty('localComicPicSrcList') &&
        Array.isArray(this.i.localComicPicSrcList)
    ) {
      this.comicPageList = this.i.comicPicLinkList.map((value: any, index: number) => {
        let item: any = {
          pageIndex: index + 1,
          pageName: `page ${index + 1}`,
          pageStatus: this.i.comicFailOrderList[index] == '-',
          pageLink: this.i.comicPicLinkList[index],
          pageSrc: this.i.localComicPicSrcList[index],
          pageChecked: false,
        }
        return item;
      })
    }
  }

  previewComicImage(item: any) {
    const images: NzImage[] = [];
    images.push({
      src: this.i.comicServerPath + '/' + this.i.comicServerDirectoryName + '/' + item.pageSrc,
      height: '700px',
      alt: item.pageName
    })
    this.nzImageService.preview(images, { nzKeyboard: true, nzMaskClosable: true, nzCloseOnNavigation: true})
  }

  openNewTab(link: string) {
    this.commonService.openNewTab(link);
  }

  downloadPages(pageList: number[]) {
    if (this.onDownloadingPage) {
      this.msgSrv.info('正在下载其他漫画');
      return;
    }
    pageList = pageList || [];
    this.onDownloadingPage = true;
    this.pageIndexOnDownloading = [...pageList];

    let taskInfo: any = {
      id: this.record.id,
      comicPhysicalPath: this.i.comicPhysicalPath,
      comicServerPath: this.i.comicServerPath,
      comicPhysicalDirectoryName: this.i.comicPhysicalDirectoryName,
      comicServerDirectoryName: this.i.comicServerDirectoryName,
      comicPicLinkList: this.i.comicPicLinkList ? this.i.comicPicLinkList : [],
      localComicPicSrcList: this.i.localComicPicSrcList ? this.i.localComicPicSrcList : [],
      comicFailOrderList: this.i.comicFailOrderList ? this.i.comicFailOrderList : [],
      pageList: pageList
    }

    // let entity: any = {
    //   comicPhysicalPath: this.i.comicPhysicalPath,
    //   comicServerPath: this.i.comicServerPath,
    //   comicPhysicalDirectoryName: this.i.comicPhysicalDirectoryName,
    //   comicServerDirectoryName: this.i.comicServerDirectoryName,
    //   comicPicLinkList: this.i.comicPicLinkList ? this.i.comicPicLinkList : [],
    //   localComicPicSrcList: this.i.localComicPicSrcList ? this.i.localComicPicSrcList : [],
    //   comicFailOrderList: this.i.comicFailOrderList ? this.i.comicFailOrderList : [],
    //   downloadPageList: [...pageList]
    // }
    // let url = `crawl/comic/download_comic/${this.record.id}`
    // let subscription: Subscription = this.http.post(url, entity).pipe(finalize(() => {
    //   this.onDownloadingPage = false;
    //   this.pageIndexOnDownloading = [];
    //   this.comicDownloadService.downloadFinishSubject.next({
    //     id: this.record.id,
    //     update: false
    //   });
    //   this.http.get(`crawl/comic/cancel_download/${this.record.id}`);
    // })).subscribe({
    //   next: async (res: any) => {
    //     this.msgSrv.success('Comic下载成功');
    //     try {
    //       await this.comicService.update({
    //         id: this.record.id,
    //         localComicPicSrcList: res?.localComicPicSrcList,
    //         comicFailOrderList: res?.comicFailOrderList,
    //         onStorage: true
    //       });
    //       await this.getComicData();
    //       this.st.reload(null, {merge: true, toTop: false});
    //       this.comicDownloadService.downloadFinishSubject.next({
    //         id: this.record.id,
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
    //         id: this.i.id,
    //         onStorage: false
    //       });
    //       await this.getComicData();
    //       this.st.reload(null, {merge: true, toTop: false});
    //       this.comicDownloadService.downloadFinishSubject.next({
    //         id: this.record.id,
    //         update: true
    //       });
    //       this.msgSrv.info('Comic入库状态更新');
    //     } catch (e) {
    //       this.msgSrv.error('Comic数据更新失败');
    //     }
    //   },
    //   complete: () => {}
    // })
    // this.comicDownloadService.downloadMissionMap.set(this.record.id, {
    //   id: this.record.id,
    //   subscription: subscription,
    //   pageList: pageList,
    // });
    // this.downloadSubscription = subscription;

    this.downloadSubscription = this.comicDownloadService.createDownloadTask(taskInfo, this.i);
  }

  onCheckSwitch(event: any, item: any) {
    this.comicPageList[item.pageIndex - 1]['pageChecked'] = event;
    // this.comicPageList[item.pageIndex - 1]['checked'] = event;
    if (this.comicPageList.every((item: any) => !item.pageChecked)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.comicPageList.every((item: any) => item.pageChecked)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }

  onCheckAllSwitch(event: any) {
    this.indeterminate = false;
    this.comicPageList = this.comicPageList.map((i: any) => {
      i.pageChecked = event;
      return i;
    })
  }

  downloadBatch() {
    let pageList: number[] = this.comicPageList.filter((i: any) => {
      return i.pageChecked;
    }).map((i: any) => {
      return i.pageIndex;
    })
    this.allChecked = false;
    this.indeterminate = false;
    this.downloadPages(pageList);
  }

  downloadAll() {
    let pageList: number[] = this.comicPageList.map((i: any) => {
      return i.pageIndex;
    })
    this.downloadPages(pageList);
  }

  terminateDownload() {
    this.downloadSubscription.unsubscribe();
  }

  autoSelectFailOrder() {
    this.comicPageList = this.comicPageList.map((i: any) => {
      if (!i.pageStatus) {
        i.pageChecked = true;
      }
      return i;
    })
  }

  async checkLocalExhentaiComic() {
    let pageList = Array.from(new Array(this.i.pageSize + 1).keys()).slice(1)
    await this.checkLocalExhentaiComicPages(this.i, pageList)
  }

  async checkLocalExhentaiComicPages(item: any, pageList: number[]) {
    // try {
    //   let entity = {
    //     comicPhysicalPath: item.comicPhysicalPath,
    //     comicServerPath: item.comicServerPath,
    //     comicPhysicalDirectoryName: item.comicPhysicalDirectoryName,
    //     comicServerDirectoryName: item.comicServerDirectoryName,
    //     comicFailOrderList: item.comicFailOrderList,
    //     localComicPicSrcList: item.localComicPicSrcList,
    //     pageList
    //   }
    //   let res = (await this.crawlService.checkLocalExhentaiComic(entity)) || {}
    //   await this.comicService.update({
    //     id: item.id,
    //     comicFailOrderList: res?.comicFailOrderList,
    //   });
    //   await this.getComicData();
    //   this.st.reload(null, {merge: true, toTop: false});
    //   this.msgSrv.success('Comic完整性验证成功');
    // } catch (e) {
    //   this.msgSrv.error('Comic完整性验证失败')
    //   console.error(e)
    // }

    let checkRes: boolean = await this.comicDownloadService.checkLocalExhentaiComicPages(item, pageList)
    if (checkRes) {
      await this.getComicData();
      this.st.reload(null, {merge: true, toTop: false});
    }
  }

  handleUploadLocalComicChange(event: any) { // upload实际上可以起到校验本地文件的作用,比使用脚本检验操作更简便直观
    if (event.type == 'success') {
      this.comicUploadSuccess = true;
      this.uploadComicPathSF.getProperty('/title')?.setValue(this.i.title, false);
      this.uploadComicPathSF.getProperty('/comicPhysicalPath')?.setValue('E:/CrawlDist/comic', false);
      this.uploadComicPathSF.getProperty('/comicServerPath')?.setValue('http://localhost:9004/comic', false);
      if (this.uploadDir) {
        let directoryName = event.file.originFileObj.webkitRelativePath.replace(`/${event.file.name}`, ``);
        this.uploadComicPathSF.getProperty('/comicPhysicalDirectoryName')?.setValue(directoryName, false);
        this.uploadComicPathSF.getProperty('/comicServerDirectoryName')?.setValue(directoryName, false);
      } else {
        this.uploadComicPathSF.getProperty('/comicPhysicalDirectoryName')?.setValue('', false);
        this.uploadComicPathSF.getProperty('/comicServerDirectoryName')?.setValue('', false);
      }
    }
  }

  previewUploadComicFile(file: NzUploadFile) {
    console.log(file)
    // const images: NzImage[] = [];
    // images.push({
    //   src: item.localCoverSrc ? item.imageServerPath + '/' + item.imageServerDirectoryName + '/' + item.localCoverSrc : '',
    //   width: '1000px',
    //   alt: item.title ? item.title : ''
    // })
    // this.nzImageService.preview(images, { nzKeyboard: true, nzMaskClosable: true, nzCloseOnNavigation: true})
  }

  resetLocalComic() {
    this.comicFileList = []
    this.comicUploadSuccess = false;
    this.uploadComicPathSF.reset();
  }

  async submitLocalComic() {
    this.submitLocalComicLoading = true;
    try {
      if (this.uploadComicPathSF.valid) {
        let localComicPicSrcList: any[] = this.comicFileList.map((i: any) => i.name).sort();
        let entity: any = {
          comicId: this.record.id,
          ...this.uploadComicPathSF.value,
          localComicPicSrcList,
        };
        await this.comicService.addLocalComic(entity);
        this.resetLocalComic();
        await this.getLocalComicListByComicId();
        this.msgSrv.success('本地Comic导入成功');
      }
    } catch (e) {
      console.error(e)
      this.msgSrv.error('本地Comic导入失败');
    }
    this.submitLocalComicLoading = false;
  }

  async getLocalComicListByComicId() {
    try {
      this.localComicList = (await this.comicService.getLocalComicListByComicId(this.record.id)) || [];
      this.previewOptions = this.localComicList.map((i: any) => {
        return { label: i.title, value: i.id, data: i }
      });
      this.previewOptions.splice(0, 0, { label: '默认预览源(Exhentai)', value: 0, data: this.i });
    } catch (e) {
      console.error(e)
    }
  }

  addEditLocalComic(id: number = 0) {
    this.modal.createStatic(ComicManageLocalComicEditComponent, {record: {id, comicInfo: this.i }}, { size: 1595 }).subscribe(async res => {
      if (res == 'ok') {
        await this.getLocalComicListByComicId();
      }
    });
  }

  async deleteLocalComic(id: number) {
    try {
      await this.comicService.deleteLocalComic(id);
      await this.getLocalComicListByComicId();
      this.msgSrv.success('本地Comic删除成功');
    } catch (e) {
      console.error(e)
    }
  }

  changePreviewList(event: any) {
    let option = this.previewOptions.find(el => el.value == event)
    if (option) {
      this.comicImageSrcList = Array.isArray(option.data.localComicPicSrcList) ? option.data.localComicPicSrcList : [];
      this.currentComicData = option.data;
    }
  }

}
