import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VideoManageVideoTagService {

  constructor(private http: _HttpClient) { }

  add(entity: any) {
    let url = `video_tag`;
    return lastValueFrom(this.http.post(url, entity));
  }

  update(entity: any) {
    let url = `video_tag/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  delete(id: number) {
    let url = `video_tag/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  getById(id: number) {
    let url = `video_tag/get`;
    return lastValueFrom(this.http.get(url, { id }));
  }

}
