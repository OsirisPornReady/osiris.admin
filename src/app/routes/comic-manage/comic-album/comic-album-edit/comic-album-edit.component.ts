import {Component, OnInit, ViewChild} from '@angular/core';
import {SFComponent, SFSchema, SFUISchema} from '@delon/form';
import {_HttpClient} from '@delon/theme';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef} from 'ng-zorro-antd/modal';

import {ComicAlbumService} from '../../../../service/comic/comic-album.service';
import {ComicService} from '../../../../service/comic/comic.service';
import {lastValueFrom} from "rxjs";
import {fallbackImageBase64} from "../../../../../assets/image-base64";

@Component({
  selector: 'app-comic-manage-comic-album-edit',
  templateUrl: './comic-album-edit.component.html',
  styleUrls: ['./comic-album-edit.component.less']
})
export class ComicManageComicAlbumEditComponent implements OnInit {
  protected readonly fallbackImageBase64 = fallbackImageBase64;

  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf', { static: false }) sf!: SFComponent;
  schema: SFSchema = {
    properties: {
      albumName: { type: 'string', title: '专辑名' },
      albumComicIdList: { type: 'string', title: '专辑漫画', enum: [] },
      selectedComic: { type: 'string', title: '漫画列表', enum: [] },
      addButton: { type: 'string', title: '' },
      adjustOrder: { type: 'string', title: '编辑' },
      comicDetailList: { type: 'string', title: '专辑细则' },
    },
    required: ['albumName'],
  };
  ui: SFUISchema = {
    '*': {
      spanLabelFixed: 100,
      grid: { span: 22 },
    },
    $albumComicIdList: {
      widget: 'select',
      allowClear: true,
      autoClearSearchValue: false,
      placeholder: '请选择漫画',
      mode: 'multiple',
      maxTagCount: 1,
      // asyncData: () => this.comicService.getSelectAll('title'),
      change: (value: any, orgData: any) => this.syncToDetail(value, orgData)
    },
    $selectedComic: {
      widget: 'select',
      allowClear: true,
      placeholder: '请选择要添加的漫画',
      // asyncData: () => this.comicService.getSelectAll('title'),
      change: (value: any, orgData: any) => this.selectedComicDetail = orgData
    },
    $addButton: {
      widget: 'custom',
    },
    $adjustOrder: {
      widget: 'custom',
    },
    $comicDetailList: {
      widget: 'custom',
    }
  };

  enum: any[] = []
  selectedComicDetail: any = null;
  comicDetailList: any[] = []
  editDetail: boolean = false;

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private comicAlbumService: ComicAlbumService,
    private comicService: ComicService
  ) {}

  async ngOnInit() {
    try {
      this.enum = await lastValueFrom(this.comicService.getSelectAll('title')) || [];
      this.schema.properties!.albumComicIdList.enum = this.enum;
      this.schema.properties!.selectedComic.enum = this.enum;
      this.sf?.refreshSchema();
    } catch (e) {
      console.error(e)
      this.msgSrv.error('请求漫画列表失败')
    }

    if (this.record.id > 0) {
      this.title = '修改';
      try {
        this.i = (await this.comicAlbumService.getById(this.record.id)) || {};
        let albumComicIdList: any[] = this.i?.albumComicIdList || [];
        this.comicDetailList = this.enum.filter((item: any) => {
          return albumComicIdList.includes(item.value)
        })
        this.comicDetailList.sort((a,b) => albumComicIdList.indexOf(a.value) - albumComicIdList.indexOf(b.value));
      } catch (e) {
        console.error(e)
        this.msgSrv.error('请求数据失败')
      }
    } else {
      this.title = '新增';
      this.i = {};
    }
  }

  async save(value: any) {
    value.albumComicIdList = this.comicDetailList.map((i: any) => i.value);
    try {
      if (this.record.id > 0) {
        await this.comicAlbumService.update(value);
      } else {
        await this.comicAlbumService.add(value);
      }
      this.msgSrv.success('保存成功');
      this.modal.close('ok');
    } catch (error) {}
  }

  close(): void {
    this.modal.destroy();
  }

  syncToDetail(value: any, orgData: any) {
    this.comicDetailList = orgData;
  }

  addToAlbumComicList() {
    if (!this.selectedComicDetail) {
      this.msgSrv.info('未选择要添加的漫画');
      return;
    }
    let albumComicIdList: any[] = this.sf.getValue('/albumComicIdList')! || []
    if (albumComicIdList.includes(this.selectedComicDetail.value)) {
      this.msgSrv.info('专辑里已有此漫画');
      return;
    }
    albumComicIdList.push(this.selectedComicDetail.value);
    this.sf.getProperty('/albumComicIdList')!.setValue(albumComicIdList, false);
    this.sf.getProperty('/albumComicIdList')!.widget.reset(albumComicIdList);
    this.comicDetailList.push(this.selectedComicDetail)
  }

  deleteFromAlbumComicList(item: any) {
    let albumComicIdList: any[] = this.sf.getValue('/albumComicIdList')! || []
    albumComicIdList = albumComicIdList.filter((i: any) => i != item.value);
    this.sf.getProperty('/albumComicIdList')!.setValue(albumComicIdList, false);
    this.sf.getProperty('/albumComicIdList')!.widget.reset(albumComicIdList);
    this.comicDetailList = this.comicDetailList.filter((i: any) => i.value != item.value);
  }

  swapComicOrder(posA: number, posB: number) {
    [this.comicDetailList[posA], this.comicDetailList[posB]] = [this.comicDetailList[posB], this.comicDetailList[posA]];
  }

}
