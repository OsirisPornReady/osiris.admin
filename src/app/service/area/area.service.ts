import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AreaService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `area`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `area/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `area/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  getById(id: number) {
    let url = `area/${id}`;
    return lastValueFrom(this.http.get(url));
    // return lastValueFrom(this.http.get(url, { id }));
  }

  getSelectAll(field = 'area') {
    //asyncData专用，不用转成promise
    let url = `area/getSelectAll`;
    let result: any[] = [];
    return this.http.get(url).pipe(
      map(res => {
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
