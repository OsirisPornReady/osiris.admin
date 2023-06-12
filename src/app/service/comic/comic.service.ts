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

  isTitleExist(title: string) {
    let url = `api/comic/is_title_exist`;
    return lastValueFrom(this.http.post(url, title));
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

  addLocalComic(entity: any) {
    let url = `api/comic/add_local_comic`;
    return lastValueFrom(this.http.post(url, entity));
  }

  updateLocalComic(entity: any) {
    let url = `api/comic/update_local_comic/${entity.id}`;
    return lastValueFrom(this.http.put(url, entity));
  }

  deleteLocalComic(id: number) {
    let url = `api/comic/delete_local_comic/${id}`;
    return lastValueFrom(this.http.delete(url));
  }

  getLocalComicById(id: number) {
    let url = `api/comic/get_local_comic_by_id/${id}`;
    return lastValueFrom(this.http.get(url));
  }

  getLocalComicListByComicId(comicId: number) {
    let url = `api/comic/get_local_comic_list_by_comic_id/${comicId}`;
    return lastValueFrom(this.http.get(url));
  }

  getComicIdListOwnLocal() {
    let url = `api/comic/get_comic_id_list_own_local`;
    return lastValueFrom(this.http.get(url));
  }

}
