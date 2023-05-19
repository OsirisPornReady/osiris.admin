import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {lastValueFrom, map, Observable} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";
import { CommonService } from "../common/common.service";

@Injectable({ providedIn: 'root' })
export class SystemSettingService {

  constructor(private http: _HttpClient, private commonService: CommonService) { }

  add(entity: any) {
    let url = `api/osiris_system_setting`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `api/osiris_system_setting/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `api/osiris_system_setting/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  getById(id: number) {
    let url = `api/osiris_system_setting/${id}`;
    return lastValueFrom(this.http.get(url));
    // return lastValueFrom(this.http.get(url, { id }));
  }

  getSelectAll(field = ''): Observable<string[] | SFSchemaEnumType[]> {
    //asyncData专用，不用转成promise
    let url = `api/osiris_system_setting/get_select_all`;
    let result: any[] = [];
    return this.http.get(url).pipe(
      map(res => {
        res = res || [];
        res.forEach((i: any) => {
          result.push({
            label: i[field],
            value: i.settingKey
          });
        });
        return result;
      })
    );
  }

  getSettingTable(field = ''): Observable<string[] | SFSchemaEnumType[]> {
    //asyncData专用，不用转成promise
    let url = `api/osiris_system_setting/get_setting_table`;
    let result: any = {};
    return this.http.get(url).pipe(
      map(res => {
        res = res || [];
        res.forEach((i: any) => {
          if (i.settingType == 1) { //字符串
            result[i.settingKey] = i.settingStringValue;
          } else if (i.settingType == 2) { //整数
            result[i.settingKey] = i.settingIntegerValue;
          } else if (i.settingType == 3) { //布尔值
            result[i.settingKey] = i.settingBooleanValue;
          }
        });
        return result;
      })
    );
  }

  async loadGlobalSettings() {
    let settings = (await lastValueFrom(this.getSettingTable())) || {}
    // Object.keys(settings).forEach((i: string) => {
    //   if (this.commonService.hasOwnProperty(i)) {
    //     this.commonService.setGlobalSetting(i, settings[i as keyof typeof settings])
    //   }
    // })

    Object.keys(settings).forEach((i: string) => {
      if (this.commonService.globalData.hasOwnProperty(i)) {
        this.commonService.setGlobalSetting(i, settings[i as keyof typeof settings])
      }
    })
  }

}
