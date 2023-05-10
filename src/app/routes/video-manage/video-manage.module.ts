import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { VideoManageRoutingModule } from './video-manage-routing.module';
import { VideoManageVideoListComponent } from './video/video-list/video-list.component';
import { VideoManageVideoEditComponent } from './video/video-edit/video-edit.component';
import { VideoManageVideoTagListComponent } from './video-tag/video-tag-list/video-tag-list.component';
import { VideoManageVideoTagEditComponent } from './video-tag/video-tag-edit/video-tag-edit.component';
import { VideoManageVideoTypeListComponent } from './video-type/video-type-list/video-type-list.component';
import { VideoManageVideoTypeEditComponent } from './video-type/video-type-edit/video-type-edit.component';
import { VideoManageVideoQualityListComponent } from './video-quality/video-quality-list/video-quality-list.component';
import { VideoManageVideoQualityEditComponent } from './video-quality/video-quality-edit/video-quality-edit.component';
import { VideoManageVideoCrawlInfoComponent } from './video/video-crawl/video-crawl-info/video-crawl-info.component';

const COMPONENTS: Type<void>[] = [
  VideoManageVideoListComponent,
  VideoManageVideoTagListComponent,
  VideoManageVideoTypeListComponent,
  VideoManageVideoQualityListComponent
];

const COMPONENTS_NOROUNT: Type<void>[] = [
  VideoManageVideoEditComponent,
  VideoManageVideoTagEditComponent,
  VideoManageVideoTypeEditComponent,
  VideoManageVideoQualityEditComponent,
  VideoManageVideoCrawlInfoComponent
];

@NgModule({
  imports: [
    SharedModule,
    VideoManageRoutingModule
  ],
  declarations:[...COMPONENTS, ...COMPONENTS_NOROUNT],
})
export class VideoManageModule { }
