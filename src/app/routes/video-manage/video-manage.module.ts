import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { VideoManageRoutingModule } from './video-manage-routing.module';
import { VideoManageVideoListComponent } from './video-list/video-list.component';
import { VideoManageVideoEditComponent } from './video-edit/video-edit.component';

const COMPONENTS: Type<void>[] = [
  VideoManageVideoListComponent,
  VideoManageVideoEditComponent];

@NgModule({
  imports: [
    SharedModule,
    VideoManageRoutingModule
  ],
  declarations: COMPONENTS,
})
export class VideoManageModule { }
