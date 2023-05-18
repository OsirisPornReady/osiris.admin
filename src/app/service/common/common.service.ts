import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map, Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { environment } from "@env/environment";

@Injectable({ providedIn: 'root' })
export class CommonService {

  NSFW_mode: boolean = true;
  searchField: number = 0;
  isEditMode: boolean = false;
  isOpenMultiSelect: boolean = false;
  isAutoCreate: boolean = true;
  isAutoFill: boolean = true;
  isAutoSubmit: boolean = true;
  crawlType: number = 0;
  isDownloadImage: boolean = true;

  public socket$!: WebSocketSubject<any>;

  constructor(private http: _HttpClient) {}

  buildJavbusLink(serialNumber: string) {
    return `https://www.javbus.com/${serialNumber}`;
  }

  buildBtdiggLink(serialNumber: string) {
    return `https://btdig.com/search?q=${serialNumber}`;
  }

  buildNyaaLink(serialNumber: string) {
    return `https://sukebei.nyaa.si/?f=0&c=0_0&q=${serialNumber}`;
  }

  recognizeSerialNumber(source: string) {
    let alphaReg = /[a-zA-Z]+/i
    let digitReg = /[0-9]+/

    let alphaPart = source.match(alphaReg)
    let digitPart = source.match(digitReg)
    if (alphaPart && digitPart) {
      return `${alphaPart[0]}-${digitPart[0]}`.toUpperCase();
    } else {
      return source;
    }
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

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

  createWebSocketSubject(socketKey: string = '') {
    if (this.socket$) {
      this.socket$.unsubscribe();
    }
    const open$ = new Subject();
    open$.subscribe((next) => {

    });
    if (environment['socketUrlTable'].hasOwnProperty(socketKey)) {
      let wsUrl = environment['socketUrlTable'][socketKey]
      this.socket$ = webSocket({
        url: wsUrl,
        openObserver: open$
      });
    }
  }

}
