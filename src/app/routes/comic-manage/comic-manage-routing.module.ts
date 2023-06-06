import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComicManageComicListComponent } from './comic/comic-list/comic-list.component';
import { ComicManageComicDownloadTaskListComponent } from './comic-download-task/comic-download-task-list/comic-download-task-list.component';

const routes: Routes = [
  { path: 'comic-list', component: ComicManageComicListComponent },
  { path: 'comic-download-task-list', component: ComicManageComicDownloadTaskListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComicManageRoutingModule { }
