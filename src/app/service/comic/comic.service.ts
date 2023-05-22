import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {lastValueFrom, map, Observable} from "rxjs";
import {SFSchemaEnumType} from "@delon/form";

@Injectable({ providedIn: 'root' })
export class ComicService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `api/comic`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `api/comic/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `api/comic/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  bulkDelete(ids: number[]) {
    let url = `api/comic/bulk_delete`;
    return lastValueFrom(this.http.post(url, ids));
  }

  getById(id: number) {
    let url = `api/comic/${id}`;
    return lastValueFrom(this.http.get(url));
    // return lastValueFrom(this.http.get(url, { id }));
  }

  getSelectAll(field = 'title'): Observable<string[] | SFSchemaEnumType[]> {
    //asyncData专用，不用转成promise
    let url = `api/comic/get_select_all`;
    let result: any[] = [];
    return this.http.get(url).pipe(
      map(res => {
        res = res || [];
        res.forEach((i: any) => {
          result.push({
            label: i[field],
            value: i.id
          });
        });
        return result;
      })
    );
  }

}
