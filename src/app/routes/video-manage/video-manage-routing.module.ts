import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoManageVideoListComponent } from './video-list/video-list.component';

const routes: Routes = [

  { path: 'video-list', component: VideoManageVideoListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoManageRoutingModule { }
