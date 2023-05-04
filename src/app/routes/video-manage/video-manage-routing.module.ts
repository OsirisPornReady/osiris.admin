import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoManageVideoListComponent } from './video/video-list/video-list.component';
import { VideoManageVideoTagListComponent } from './video-tag/video-tag-list/video-tag-list.component';
import { VideoManageVideoTypeListComponent } from './video-type/video-type-list/video-type-list.component';

const routes: Routes = [

  { path: 'video-list', component: VideoManageVideoListComponent },
  { path: 'video-tag-list', component: VideoManageVideoTagListComponent },
  { path: 'video-type-list', component: VideoManageVideoTypeListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoManageRoutingModule { }
