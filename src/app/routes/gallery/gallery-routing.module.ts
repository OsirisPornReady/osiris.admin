import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryVideoGalleryComponent } from './video-gallery/video-gallery.component';

const routes: Routes = [

  { path: 'video-gallery', component: GalleryVideoGalleryComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GalleryRoutingModule { }
