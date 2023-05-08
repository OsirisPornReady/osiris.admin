import {Injectable} from '@angular/core';
import {_HttpClient} from '@delon/theme';
import {lastValueFrom, map} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VideoQualityService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `video_quality`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `video_quality/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `video_quality/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  getById(id: number) {
    let url = `video_quality/${id}`;
    return lastValueFrom(this.http.get(url));
    // return lastValueFrom(this.http.get(url, { id }));
  }

  getSelectAll(field = 'quality') {
    //asyncData专用，不用转成promise
    let url = `video_quality/getSelectAll`;
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

  getDict() {
    let url = `video_quality/getSelectAll`;
    let result: any = {};
    let ret = this.http.get(url).pipe(
      map(res => {
        res.forEach((i: any) => {
          result[i.id] = {
            text: i.quality,
            color: i.color
          };
        });
        return result;
      })
    );
    return lastValueFrom(ret);
  }

}
