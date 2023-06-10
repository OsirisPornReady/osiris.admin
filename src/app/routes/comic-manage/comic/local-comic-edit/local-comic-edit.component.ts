import {Component, OnInit, ViewChild} from '@angular/core';
import {SFComponent, SFSchema, SFUISchema} from '@delon/form';
import {_HttpClient} from '@delon/theme';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {NzUploadFile} from "ng-zorro-antd/upload";

import {ComicService} from '../../../../service/comic/comic.service';
import {CommonService} from '../../../../service/common/common.service';

import {environment} from "@env/environment";

@Component({
  selector: 'app-comic-manage-local-comic-edit',
  templateUrl: './local-comic-edit.component.html',
})
export class ComicManageLocalComicEditComponent implements OnInit {
  comicUploadUrl: string = environment['comicUploadUrl'];

  title = '';
  record: any = {};
  i: any;
  @ViewChild('sf') sf!: SFComponent
  schema: SFSchema = {
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
      grid: { span: 22 },
    },
  };

  comicFileList: NzUploadFile[] = [];
  comicUploadSuccess: boolean = true;
  uploadDir: boolean = true;
  loading: boolean = false;

  constructor(
    private modal: NzModalRef,
    private msgSrv: NzMessageService,
    public http: _HttpClient,
    private comicService: ComicService,
    private commonService: CommonService,
  ) {}

  async ngOnInit() {
    if (this.record.id > 0) {
      this.title = '导入本地漫画';
      let res = (await this.comicService.getLocalComicById(this.record.id)) || {}
      res.localComicPicSrcList = res.localComicPicSrcList || []
      this.i = res;
      this.comicFileList = res.localComicPicSrcList.map((item: any, index: number) => {
        return {
          uid: `${index}`,
          name: item,
          status: 'done',
          url: `${res.comicServerPath}/${res.comicServerDirectoryName}/${item}`
        }
      });
    } else {
      this.title = '修改本地漫画';
      this.i = {};
    }
  }

  async save(value: any) {
    this.loading = true;
    try {
      let localComicPicSrcList: any[] = this.comicFileList.map((i: any) => i.name).sort();
      let entity: any = {
        comicId: this.record.comicInfo.id,
        ...value,
      };
      entity.localComicPicSrcList = localComicPicSrcList;
      if (this.record.id > 0) {
        await this.comicService.updateLocalComic(entity);
      } else {
        await this.comicService.addLocalComic(entity);
      }
      this.msgSrv.success('本地Comic导入成功');
      this.modal.close('ok');
    } catch (e) {
      console.error(e)
      this.msgSrv.error('本地Comic导入失败');
    }
    this.loading = true;
  }

  reset() {
    this.comicFileList = []
    this.comicUploadSuccess = false;
    this.sf.reset();
  }

  close(): void {
    this.modal.destroy();
  }

  handleUploadLocalComicChange(event: any) { // upload实际上可以起到校验本地文件的作用,比使用脚本检验操作更简便直观
    if (event.type == 'success') {
      this.comicUploadSuccess = true;
      if (this.record.id == 0) {
        this.sf.getProperty('/title')?.setValue(this.record.comicInfo.title, false);
        this.sf.getProperty('/comicPhysicalPath')?.setValue(this.record.comicInfo.comicPhysicalPath, false);
        this.sf.getProperty('/comicServerPath')?.setValue(this.record.comicInfo.comicServerPath, false);
        if (this.uploadDir) {
          let directoryName = event.file.originFileObj.webkitRelativePath.replace(`/${event.file.name}`, ``);
          this.sf.getProperty('/comicPhysicalDirectoryName')?.setValue(directoryName, false);
          this.sf.getProperty('/comicServerDirectoryName')?.setValue(directoryName, false);
        } else {
          this.sf.getProperty('/comicPhysicalDirectoryName')?.setValue('', false);
          this.sf.getProperty('/comicServerDirectoryName')?.setValue('', false);
        }
      }
    } else if (event.type == 'error') {
      this.comicUploadSuccess = false;
    }
  }

  previewUploadComicFile(file: NzUploadFile) {
    // const images: NzImage[] = [];
    // images.push({
    //   src: item.localCoverSrc ? item.imageServerPath + '/' + item.imageServerDirectoryName + '/' + item.localCoverSrc : '',
    //   width: '1000px',
    //   alt: item.title ? item.title : ''
    // })
    // this.nzImageService.preview(images, { nzKeyboard: true, nzMaskClosable: true, nzCloseOnNavigation: true})
  }

}
