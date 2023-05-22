import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { ComicManageRoutingModule } from './comic-manage-routing.module';
import { ComicManageComicListComponent } from './comic/comic-list/comic-list.component';
import { ComicManageComicEditComponent } from './comic/comic-edit/comic-edit.component';
import { ComicManageComicCrawlInfoComponent } from './comic/comic-crawl/comic-crawl-info/comic-crawl-info.component';
import { ComicManageComicCrawlConfigComponent } from './comic/comic-crawl/comic-crawl-config/comic-crawl-config.component';
import { ComicManageComicInfoComponent } from './comic/comic-info/comic-info.component';

const COMPONENTS: Type<void>[] = [
  ComicManageComicListComponent,
];

const COMPONENTS_NOROUNT: Type<void>[] = [
  ComicManageComicEditComponent,
  ComicManageComicCrawlInfoComponent,
  ComicManageComicCrawlConfigComponent,
  ComicManageComicInfoComponent
]

@NgModule({
  imports: [
    SharedModule,
    ComicManageRoutingModule
  ],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
})
export class ComicManageModule { }
