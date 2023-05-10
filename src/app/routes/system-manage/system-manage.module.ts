import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { SystemManageRoutingModule } from './system-manage-routing.module';
import { SystemManageAreaListComponent } from './area/area-list/area-list.component';
import { SystemManageAreaEditComponent } from './area/area-edit/area-edit.component';
import { SystemManageSystemConfigComponent } from './system-config/system-config.component';

const COMPONENTS: Type<void>[] = [
  SystemManageAreaListComponent
,
  SystemManageSystemConfigComponent];

const COMPONENTS_NOROUNT: Type<void>[] = [
  SystemManageAreaEditComponent
];

@NgModule({
  imports: [
    SharedModule,
    SystemManageRoutingModule
  ],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
})
export class SystemManageModule { }
