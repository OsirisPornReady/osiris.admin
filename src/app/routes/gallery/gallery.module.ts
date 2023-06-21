import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryVideoGalleryComponent } from './video-gallery/video-gallery.component';
import { GalleryComicGalleryComponent } from './comic-gallery/comic-gallery.component';
import { GalleryTorrentListComponent } from './torrent-list/torrent-list.component';

const COMPONENTS: Type<void>[] = [
  GalleryVideoGalleryComponent,
  GalleryComicGalleryComponent,
  GalleryTorrentListComponent,
];

@NgModule({
  imports: [
    SharedModule,
    GalleryRoutingModule
  ],
  declarations: COMPONENTS,
})
export class GalleryModule { }
