import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { VideoManageRoutingModule } from './video-manage-routing.module';
import { VideoManageVideoListComponent } from './video/video-list/video-list.component';
import { VideoManageVideoEditComponent } from './video/video-edit/video-edit.component';
import { VideoManageVideoTagListComponent } from './video-tag/video-tag-list/video-tag-list.component';
import { VideoManageVideoTagEditComponent } from './video-tag/video-tag-edit/video-tag-edit.component';

const COMPONENTS: Type<void>[] = [
  VideoManageVideoListComponent,
  VideoManageVideoEditComponent,
  VideoManageVideoTagListComponent,
  VideoManageVideoTagEditComponent];

@NgModule({
  imports: [
    SharedModule,
    VideoManageRoutingModule
  ],
  declarations: COMPONENTS,
})
export class VideoManageModule { }
