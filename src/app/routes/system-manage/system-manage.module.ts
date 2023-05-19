import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { SystemManageRoutingModule } from './system-manage-routing.module';
import { SystemManageAreaListComponent } from './area/area-list/area-list.component';
import { SystemManageAreaEditComponent } from './area/area-edit/area-edit.component';
import { SystemManageSystemConfigComponent } from './system-config/system-config.component';
import { SystemManageCrawlTypeListComponent } from './crawl-type/crawl-type-list/crawl-type-list.component';
import { SystemManageCrawlTypeEditComponent } from './crawl-type/crawl-type-edit/crawl-type-edit.component';
import { SystemManageSystemSettingListComponent } from './system-setting/system-setting-list/system-setting-list.component';
import { SystemManageSystemSettingEditComponent } from './system-setting/system-setting-edit/system-setting-edit.component';

const COMPONENTS: Type<void>[] = [
  SystemManageAreaListComponent,
  SystemManageCrawlTypeListComponent,
  SystemManageSystemConfigComponent,
  SystemManageSystemSettingListComponent
];

const COMPONENTS_NOROUNT: Type<void>[] = [
  SystemManageAreaEditComponent,
  SystemManageCrawlTypeEditComponent,
  SystemManageSystemSettingEditComponent
];

@NgModule({
  imports: [
    SharedModule,
    SystemManageRoutingModule
  ],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
})
export class SystemManageModule { }
