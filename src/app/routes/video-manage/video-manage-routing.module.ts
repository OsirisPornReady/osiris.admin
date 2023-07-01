import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoManageVideoListComponent } from './video/video-list/video-list.component';
import { VideoManageVideoTagListComponent } from './video-tag/video-tag-list/video-tag-list.component';
import { VideoManageVideoTypeListComponent } from './video-type/video-type-list/video-type-list.component';
import { VideoManageVideoQualityListComponent } from './video-quality/video-quality-list/video-quality-list.component';
import { VideoManageVideoAlbumListComponent } from './video-album/video-album-list/video-album-list.component';
import { VideoManageVideoDownloadTaskListComponent } from './video-download-task/video-download-task-list/video-download-task-list.component';
import { VideoManageVideoCrawlTaskListComponent } from './video/video-crawl/video-crawl-task-list/video-crawl-task-list.component';

const routes: Routes = [
  { path: 'video-list', component: VideoManageVideoListComponent },
  { path: 'video-tag-list', component: VideoManageVideoTagListComponent },
  { path: 'video-type-list', component: VideoManageVideoTypeListComponent },
  { path: 'video-quality-list', component: VideoManageVideoQualityListComponent },
  { path: 'video-album-list', component: VideoManageVideoAlbumListComponent },
  { path: 'video-download-task-list', component: VideoManageVideoDownloadTaskListComponent },
  { path: 'video-crawl-task-list', component: VideoManageVideoCrawlTaskListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoManageRoutingModule { }
