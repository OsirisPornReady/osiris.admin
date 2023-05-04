import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { CastManageRoutingModule } from './cast-manage-routing.module';
import { CastManageCastListComponent } from './cast/cast-list/cast-list.component';
import { CastManageCastEditComponent } from './cast/cast-edit/cast-edit.component';

const COMPONENTS: Type<void>[] = [
  CastManageCastListComponent,
];

const COMPONENTS_NOROUNT: Type<void>[] = [
  CastManageCastEditComponent
];

@NgModule({
  imports: [
    SharedModule,
    CastManageRoutingModule
  ],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
})
export class CastManageModule { }
