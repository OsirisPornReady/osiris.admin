import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemManageAreaListComponent } from './area/area-list/area-list.component';

const routes: Routes = [
  { path: 'area-list', component: SystemManageAreaListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemManageRoutingModule { }
