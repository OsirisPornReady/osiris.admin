import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VideoService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `video`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `video/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `video/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  getById(id: number) {
    let url = `video/get`;
    return lastValueFrom(this.http.get(url, { id }));
  }

  getSelectAll(field = '') {
    //asyncData专用，不用转成promise
    let url = `video/getSelectAll`;
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
