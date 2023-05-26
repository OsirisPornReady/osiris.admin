import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { GalleryRoutingModule } from './gallery-routing.module';
import { GalleryVideoGalleryComponent } from './video-gallery/video-gallery.component';
import { GalleryComicGalleryComponent } from './comic-gallery/comic-gallery.component';

const COMPONENTS: Type<void>[] = [
  GalleryVideoGalleryComponent,
  GalleryComicGalleryComponent
];

@NgModule({
  imports: [
    SharedModule,
    GalleryRoutingModule
  ],
  declarations: COMPONENTS,
})
export class GalleryModule { }
