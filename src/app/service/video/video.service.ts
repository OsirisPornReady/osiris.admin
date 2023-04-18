import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VideoService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `video/add`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `video/update`;
    return lastValueFrom(this.http.put(url, entity));
  }

  get(params: any) {
    let url = `video/get`;
    return lastValueFrom(this.http.get(url, params));
  }
}
