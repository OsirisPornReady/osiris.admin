import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { VideoManageRoutingModule } from './video-manage-routing.module';

import {NgOptimizedImage} from "@angular/common";

import { VideoManageVideoListComponent } from './video/video-list/video-list.component';
import { VideoManageVideoEditComponent } from './video/video-edit/video-edit.component';
import { VideoManageVideoTagListComponent } from './video-tag/video-tag-list/video-tag-list.component';
import { VideoManageVideoTagEditComponent } from './video-tag/video-tag-edit/video-tag-edit.component';
import { VideoManageVideoTypeListComponent } from './video-type/video-type-list/video-type-list.component';
import { VideoManageVideoTypeEditComponent } from './video-type/video-type-edit/video-type-edit.component';
import { VideoManageVideoQualityListComponent } from './video-quality/video-quality-list/video-quality-list.component';
import { VideoManageVideoQualityEditComponent } from './video-quality/video-quality-edit/video-quality-edit.component';
import { VideoManageVideoCrawlInfoComponent } from './video/video-crawl/video-crawl-info/video-crawl-info.component';
import { VideoManageVideoCrawlConfigComponent } from './video/video-crawl/video-crawl-config/video-crawl-config.component';
import { VideoManageVideoInfoComponent } from './video/video-info/video-info.component';
import { VideoManageVideoEvaluateComponent } from './video/video-evaluate/video-evaluate.component';
import { VideoManageVideoAlbumListComponent } from './video-album/video-album-list/video-album-list.component';
import { VideoManageVideoAlbumEditComponent } from './video-album/video-album-edit/video-album-edit.component';
import { VideoManageVideoCollectComponent } from './video/video-select-album/video-collect.component';
import { VideoManageVideoDownloadTaskListComponent } from './video-download-task/video-download-task-list/video-download-task-list.component';
import { VideoManageLocalVideoEditComponent } from './video/local-video-edit/local-video-edit.component';
import { VideoManageVideoCrawlTaskListComponent } from './video/video-crawl/video-crawl-task-list/video-crawl-task-list.component';
import { VideoManageVideoCustomTagsEditComponent } from './video/video-custom-tags-edit/video-custom-tags-edit.component';
import { VideoManageVideoCustomSortOrderEditComponent } from './video/video-custom-order-edit/video-custom-sort-order-edit.component';

const COMPONENTS: Type<void>[] = [
  VideoManageVideoListComponent,
  VideoManageVideoTagListComponent,
  VideoManageVideoTypeListComponent,
  VideoManageVideoQualityListComponent,
  VideoManageVideoAlbumListComponent,
  VideoManageVideoDownloadTaskListComponent,
  VideoManageVideoCrawlTaskListComponent
];

const COMPONENTS_NOROUNT: Type<void>[] = [
  VideoManageVideoEditComponent,
  VideoManageVideoTagEditComponent,
  VideoManageVideoTypeEditComponent,
  VideoManageVideoQualityEditComponent,
  VideoManageVideoCrawlInfoComponent,
  VideoManageVideoCrawlConfigComponent,
  VideoManageVideoInfoComponent,
  VideoManageVideoEvaluateComponent,
  VideoManageVideoAlbumEditComponent,
  VideoManageVideoCollectComponent,
  VideoManageLocalVideoEditComponent,
  VideoManageVideoCustomTagsEditComponent,
  VideoManageVideoCustomSortOrderEditComponent
];

@NgModule({
  imports: [
    SharedModule,
    VideoManageRoutingModule,
    NgOptimizedImage
  ],
  declarations:[...COMPONENTS, ...COMPONENTS_NOROUNT],
})
export class VideoManageModule { }
