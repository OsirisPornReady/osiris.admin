import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommonService {

  NSFW_mode: boolean = true;

  constructor(private http: _HttpClient) {}


}
