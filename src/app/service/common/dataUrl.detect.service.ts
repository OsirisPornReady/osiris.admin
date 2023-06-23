import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map, Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { environment } from "@env/environment";
import { GlobalData } from "../../model/GlobalData";

@Injectable({ providedIn: 'root' })
export class DataUrlDetectService {

  constructor(private http: _HttpClient) {}

  detectUrlType(source: string): string | null {
    if (source.includes('www.javbus.com')) {
      return 'crawl/video/javbus';
    }
    if (source.includes('www.brazzers.com/video')) {
      return 'crawl/video/brazzers';
    }
    if (source.includes('www.realitykings.com/scene')) {
      return 'crawl/video/reality_kings';
    }
    if (source.includes('www.transangels.com/scene')) {
      return 'crawl/video/trans_angels';
    }
    if (source.includes('exhentai.org/g')) {
      return 'crawl/comic/exhentai';
    }
    return null;
  }

}
