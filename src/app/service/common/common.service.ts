import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from "rxjs/webSocket";

@Injectable({ providedIn: 'root' })
export class CommonService {

  NSFW_mode: boolean = true;
  public socket$!: WebSocketSubject<any>;

  constructor(private http: _HttpClient) {}

  //原生的socket方法，如果有推送要求最好加上asObservable
  // createSocket(wsUrl:string = 'ws://localhost:8100/socketTest') {
  //   let socket$: any = new WebSocket(wsUrl);
  //   socket$.onopen = function () {
  //     console.log('开启socket')
  //   }
  //   socket$.onmessage = function () {
  //     console.log('发信了')
  //   }
  //   return socket$
  // }

  createWebSocketSubject(wsUrl:string = 'ws://localhost:8100/socketTest') {
    this.socket$ = webSocket(wsUrl);
  }

}
