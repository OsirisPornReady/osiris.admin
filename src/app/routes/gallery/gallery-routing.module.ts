import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryVideoGalleryComponent } from './video-gallery/video-gallery.component';
import { GalleryComicGalleryComponent } from './comic-gallery/comic-gallery.component';
import { GalleryVideoDownloadTaskListComponent } from "./video-download-task/video-download-task-list/video-download-task-list.component";

const routes: Routes = [
  { path: 'video-gallery', component: GalleryVideoGalleryComponent },
  { path: 'comic-gallery', component: GalleryComicGalleryComponent },
  { path: 'video-download-task-list', component: GalleryVideoDownloadTaskListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GalleryRoutingModule { }
