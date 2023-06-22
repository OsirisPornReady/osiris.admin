import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {lastValueFrom, map, Observable} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";

@Injectable({ providedIn: 'root' })
export class VideoService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `api/video`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `api/video/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `api/video/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  bulkDelete(ids: number[]) {
    let url = `api/video/bulk_delete`;
    return lastValueFrom(this.http.post(url, ids));
  }

  getById(id: number) {
    let url = `api/video/${id}`;
    return lastValueFrom(this.http.get(url));
    // return lastValueFrom(this.http.get(url, { id }));
  }

  isSerialNumberExist(serialNumber: string) {
    let url = `api/video/is_serial_number_exist/${serialNumber}`;
    return lastValueFrom(this.http.get(url));
  }

  isTitleExist(title: string) {
    let url = `api/video/is_title_exist`;
    return lastValueFrom(this.http.post(url, title));
  }

  switchVideoSubscription(id: number) {
    let url = `api/video/switch_video_subscription/${id}`;
    return lastValueFrom(this.http.get(url));
  }

  getSelectAll(field = ''): Observable<string[] | SFSchemaEnumType[]> {
    //asyncData专用，不用转成promise
    let url = `api/video/get_select_all`;
    let result: any[] = [];
    return this.http.get(url).pipe(
      map(res => {
        res = res || [];
        res.forEach((i: any) => {
          result.push({
            label: i.existSerialNumber ? `(${i.serialNumber})${i[field]}` : `${i[field]}`,
            value: i.id,
            orgData: i
          });
        });
        return result;
      })
    );
  }

  getTransferAll(field = ''): Observable<string[] | SFSchemaEnumType[]> {
    //asyncData专用，不用转成promise
    let url = `api/video/get_select_all`;
    let result: any[] = [];
    return this.http.get(url).pipe(
      map(res => {
        res = res || [];
        res.forEach((i: any) => {
          result.push({
            title: i[field],
            value: i.id
          });
        });
        return result;
      })
    );
  }

  deleteVideoLocalImage(entity: any) {
    let url = `crawl/delete_video_local_image`;
    return lastValueFrom(this.http.post(url, entity));
  }

}
