import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComicManageComicListComponent } from './comic/comic-list/comic-list.component';

const routes: Routes = [

  { path: 'comic-list', component: ComicManageComicListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComicManageRoutingModule { }
