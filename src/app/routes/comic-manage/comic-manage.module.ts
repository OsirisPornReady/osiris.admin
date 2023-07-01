import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { ComicManageRoutingModule } from './comic-manage-routing.module';
import { ComicManageComicListComponent } from './comic/comic-list/comic-list.component';
import { ComicManageComicEditComponent } from './comic/comic-edit/comic-edit.component';
import { ComicManageComicCrawlInfoComponent } from './comic/comic-crawl/comic-crawl-info/comic-crawl-info.component';
import { ComicManageComicCrawlConfigComponent } from './comic/comic-crawl/comic-crawl-config/comic-crawl-config.component';
import { ComicManageComicInfoComponent } from './comic/comic-info/comic-info.component';
import { ComicManageComicEvaluateComponent } from './comic/comic-evaluate/comic-evaluate.component';
import { ComicManageComicDownloadConfigComponent } from './comic/comic-download-config/comic-download-config.component';
import { ComicManageComicDownloadTaskListComponent } from './comic-download-task/comic-download-task-list/comic-download-task-list.component';
import { ComicManageLocalComicEditComponent } from './comic/local-comic-edit/local-comic-edit.component';
import { ComicManageComicAlbumListComponent } from './comic-album/comic-album-list/comic-album-list.component';
import { ComicManageComicAlbumEditComponent } from './comic-album/comic-album-edit/comic-album-edit.component';
import { ComicManageComicCrawlTaskListComponent } from './comic/comic-crawl/comic-crawl-task-list/comic-crawl-task-list.component';

const COMPONENTS: Type<void>[] = [
  ComicManageComicListComponent,
  ComicManageComicAlbumListComponent,
  ComicManageComicCrawlTaskListComponent
];

const COMPONENTS_NOROUNT: Type<void>[] = [
  ComicManageComicEditComponent,
  ComicManageComicCrawlInfoComponent,
  ComicManageComicCrawlConfigComponent,
  ComicManageComicInfoComponent,
  ComicManageComicEvaluateComponent,
  ComicManageComicDownloadConfigComponent,
  ComicManageComicDownloadTaskListComponent,
  ComicManageLocalComicEditComponent,
  ComicManageComicAlbumEditComponent
]

@NgModule({
  imports: [
    SharedModule,
    ComicManageRoutingModule
  ],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
})
export class ComicManageModule { }
