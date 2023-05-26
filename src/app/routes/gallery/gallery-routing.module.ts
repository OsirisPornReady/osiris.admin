import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryVideoGalleryComponent } from './video-gallery/video-gallery.component';
import { GalleryComicGalleryComponent } from './comic-gallery/comic-gallery.component';

const routes: Routes = [

  { path: 'video-gallery', component: GalleryVideoGalleryComponent },
  { path: 'comic-gallery', component: GalleryComicGalleryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GalleryRoutingModule { }
