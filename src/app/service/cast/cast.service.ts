import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {lastValueFrom, map, Observable} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";

@Injectable({ providedIn: 'root' })
export class CastService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `api/cast`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `api/cast/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `api/cast/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  getById(id: number) {
    let url = `api/cast/${id}`;
    return lastValueFrom(this.http.get(url));
    // return lastValueFrom(this.http.get(url, { id }));
  }

  getSelectAll(field = 'name'): Observable<string[] | SFSchemaEnumType[]> {
    //asyncData专用，不用转成promise
    let url = `api/cast/get_select_all`;
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
