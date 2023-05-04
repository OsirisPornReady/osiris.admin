import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CastManageCastListComponent } from './cast/cast-list/cast-list.component';

const routes: Routes = [
  { path: 'cast-list', component: CastManageCastListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CastManageRoutingModule { }
