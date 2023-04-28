import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ActorService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `actor/add`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `actor/update`;
    return lastValueFrom(this.http.put(url, entity));
  }

  get(params: any) {
    let url = `actor/get`;
    return lastValueFrom(this.http.get(url, params));
  }

  getSelectList(field = 'name') {
    //asyncData专用，不用转成promise
    let url = `actor/getSelectList`;
    let result: any[] = [];
    return this.http.get(url).pipe(
      map(res => {
        res.forEach((i: any) => {
          result.push({
            label: i[field],
            value: i.value
          });
        });
        return result;
      })
    );
  }
}
