import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemManageAreaListComponent } from './area/area-list/area-list.component';
import { SystemManageCrawlTypeListComponent } from './crawl-type/crawl-type-list/crawl-type-list.component';

const routes: Routes = [
  { path: 'area-list', component: SystemManageAreaListComponent },
  { path: 'crawl-list', component: SystemManageCrawlTypeListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemManageRoutingModule { }
