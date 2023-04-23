import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommonService {
  constructor(private http: _HttpClient) {}

  getSelectList(field = 'label') {
    //asyncData专用，不用转成promise
    let url = `common/getSelectList`;
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
