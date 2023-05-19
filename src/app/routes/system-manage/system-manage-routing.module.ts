import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemManageAreaListComponent } from './area/area-list/area-list.component';
import { SystemManageCrawlTypeListComponent } from './crawl-type/crawl-type-list/crawl-type-list.component';
import { SystemManageSystemSettingListComponent } from './system-setting/system-setting-list/system-setting-list.component';

const routes: Routes = [
  { path: 'system-setting', component: SystemManageSystemSettingListComponent },
  { path: 'crawl-list', component: SystemManageCrawlTypeListComponent },
  { path: 'area-list', component: SystemManageAreaListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemManageRoutingModule { }
