import {Injectable} from '@angular/core';
import {_HttpClient} from '@delon/theme';
import {lastValueFrom, map, Observable} from 'rxjs';
import {SFSchemaEnumType} from "@delon/form";

@Injectable({ providedIn: 'root' })
export class VideoQualityService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `api/video_quality`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `api/video_quality/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `api/video_quality/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  getById(id: number) {
    let url = `api/video_quality/${id}`;
    return lastValueFrom(this.http.get(url));
    // return lastValueFrom(this.http.get(url, { id }));
  }

  getSelectAll(field = 'quality'): Observable<string[] | SFSchemaEnumType[]> {
    //asyncData专用，不用转成promise
    let url = `api/video_quality/get_select_all`;
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
    let url = `api/video_quality/get_select_all`;
    let result: any = {};
    let ret = this.http.get(url).pipe(
      map(res => {
        res = res || [];
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
