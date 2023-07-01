import { Component, OnInit, ViewChild } from '@angular/core';
import { STColumn, STComponent, STPage } from '@delon/abc/st';
import { SFSchema } from '@delon/form';
import { ModalHelper, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import {NzImage, NzImageService} from "ng-zorro-antd/image";

import { ComicDownloadService } from '../../../../service/comic/comic-download.service';
import {Subscription} from "rxjs";
import {VideoDownloadTaskService} from "../../../../service/video/video-download-task.service";
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-video-manage-video-download-task-list',
  templateUrl: './video-download-task-list.component.html',
})
export class VideoManageVideoDownloadTaskListComponent implements OnInit {
  // url = `/api/video_quality/get_by_page`;

  data: any;
  page: STPage = {
    showSize: true,
    pageSizes: [10, 20, 30, 40, 50],
    showQuickJumper: true,
  };
  searchSchema: SFSchema = {
    properties: {
      no: {
        type: 'string',
        title: '编号'
      }
    }
  };
  @ViewChild('st') private readonly st!: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'checked', type: 'checkbox' },
    { title: '视频标题', index: 'videoInfo.title', width: 200, render: 'customTitle' },
    { title: '磁链名', index: 'torrentInfo.torrent_name', width: 300, render: 'customTorrentName' },
    { title: '文件数量', index: 'torrentInfo.torrent_files', width: 100, className: 'text-center' },
    { title: '总大小', index: 'torrentInfo.torrent_size', width: 100, className: 'text-grey' },
    { title: '磁链时间', index: 'torrentInfo.torrent_age', className: 'text-success' },
    { title: '视频大小', index: 'torrentInfo.torrent_size', width: 100, className: 'text-blue' },
    { title: '发行时间', type: 'date', dateFormat: 'yyyy-MM-dd', index: 'videoInfo.publishTime', sort: true },
    // { title: '标签颜色', index: 'color' },
    // { title: '该分辨率下的视频数', type: 'number', index: 'videoCount' },
    // { title: '更新时间', type: 'date', index: 'updateTime' },
    {
      title: '操作',
      buttons: [
        {
          text: '下载',
          // type: 'static',
          click: (item: any) => {
            this.openTorrentMagnetLink(item.torrentMagnet);
          }
        },
        {
          text: '删除',
          type: 'del',
          pop: true,
          click: (item: any) => {
            this.delete(item);
          }
        }
      ]
    }
  ];

  downloadFinishSubscription: Subscription = new Subscription();
  copiedTaskList: string[] = []

  constructor(
    private http: _HttpClient,
    private modal: ModalHelper,
    private msgSrv: NzMessageService,
    private videoDownloadTaskService: VideoDownloadTaskService,
    private nzImageService: NzImageService,
    private nzModal: NzModalService,
  ) { }

  ngOnInit(): void {
    // this.downloadFinishSubscription = this.videoDownloadTaskService.downloadFinishSubject.subscribe(async (res: any) => {
    //   if (res.update) {
    //     this.getData();
    //     this.st.reload(null, {merge: true, toTop: false});
    //   }
    // })
    this.getData();
  }

  getData() {
    // this.data = Array.from(this.videoDownloadTaskService.downloadMissionMap.values());
    this.data = this.videoDownloadTaskService.videoDownloadTaskList;
  }

  addEdit(id: number = 0): void {
    // this.modal.createStatic(VideoManageVideoQualityEditComponent, { record: { id } }).subscribe(res => {
    //   if (res == 'ok') {
    //     this.st.reload();
    //   }
    // });
  }

  delete(item: any) {
    try {
      this.videoDownloadTaskService.videoDownloadTaskList = this.videoDownloadTaskService.videoDownloadTaskList.filter((i: any) => i.torrentMagnet != item.torrentMagnet);
      if (this.videoDownloadTaskService.downloadMissionMap.has(item.torrentMagnet)) {
        this.videoDownloadTaskService.downloadMissionMap.delete(item.torrentMagnet);
      }
      this.msgSrv.success('下载任务删除成功');
      this.getData();
      this.st.reload();
    } catch (e) {
      console.error(e);
    }
  }

  bulkDelete(_data: any) {
    try {
      let torrentMagnetList: string[] = [];
      torrentMagnetList = _data.filter((item: any) => {
        return (item.hasOwnProperty('checked') && item.checked)
      }).map((item: any) => {
          return item.torrentMagnet
        })
      if (torrentMagnetList.length > 0) {
        this.nzModal.confirm({
          nzTitle: '确认删除吗？',
          nzOkText: '删除',
          nzOkDanger: true,
          nzOnOk: async () => {
            this.videoDownloadTaskService.videoDownloadTaskList = this.videoDownloadTaskService.videoDownloadTaskList.filter((i: any) => !torrentMagnetList.includes(i.torrentMagnet));
            torrentMagnetList.forEach((i: any) => {
              if (this.videoDownloadTaskService.downloadMissionMap.has(i)) {
                this.videoDownloadTaskService.downloadMissionMap.delete(i);
              }
            })
            this.msgSrv.success('操作成功!');
            this.getData();
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

  bulkDownload(_data: any) {
    try {
      let torrentMagnetList: string[] = [];
      torrentMagnetList = _data.filter((item: any) => {
        return (item.hasOwnProperty('checked') && item.checked)
      }).map((item: any) => {
        return item.torrentMagnet
      })
      if (torrentMagnetList.length > 0) {
        this.nzModal.confirm({
          nzTitle: '确认下载吗？',
          nzOkText: '下载',
          nzOnOk: async () => {
            let listString = ``;
            let copiedTaskList: string[] = [];
            torrentMagnetList.forEach((i: any) => {
              listString += `${i}\n`;
              copiedTaskList.push(i);
            })
            navigator.clipboard.writeText(listString)
              .then(() => {
                this.msgSrv.success('链接已复制');
                this.st.clearCheck();
                this.copiedTaskList = copiedTaskList;
              })
              .catch((err) => {
                console.error(err);
                this.msgSrv.error('操作失败');
              });
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

  previewVideoImage(videoItem: any) {
    const images: NzImage[] = [];
    images.push({
      src: videoItem.coverBase64,
      width: '1000px',
      alt: videoItem.title ? videoItem.title : ''
    })
    this.nzImageService.preview(images, { nzKeyboard: true, nzMaskClosable: true, nzCloseOnNavigation: true})
  }

  openTorrentMagnetLink(link: string) {
    window.open(link, '_self')
  }

  handleSTChange(event: any) {
    // if (event.type == 'click') {
    //   this.st.setRow(event.click.index, { checked: !event.click.item.checked });
    // }
    // if (event.type == 'check') {
    //
    // }
  }

}
