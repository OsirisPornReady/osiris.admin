import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComicManageComicListComponent } from './comic/comic-list/comic-list.component';
import { ComicManageComicDownloadTaskListComponent } from './comic-download-task/comic-download-task-list/comic-download-task-list.component';
import { ComicManageComicAlbumListComponent } from './comic-album/comic-album-list/comic-album-list.component';
import { ComicManageComicCrawlTaskListComponent } from './comic/comic-crawl/comic-crawl-task-list/comic-crawl-task-list.component';

const routes: Routes = [
  { path: 'comic-list', component: ComicManageComicListComponent },
  { path: 'comic-download-task-list', component: ComicManageComicDownloadTaskListComponent },
  { path: 'comic-album-list', component: ComicManageComicAlbumListComponent },
  { path: 'comic-crawl-task-list', component: ComicManageComicCrawlTaskListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComicManageRoutingModule { }
