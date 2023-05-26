import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { lastValueFrom, map, Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { environment } from "@env/environment";
import { GlobalData } from "../../model/GlobalData";

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

  globalData: any = {
    isEditMode: false,
    isOpenMultiSelect: false,
    isAutoCreate: true,
    isAutoFill: true,
    isAutoSubmit: true,
    isDownloadImage: true,
    imagePhysicalPath: 'E:/CrawlDist/image',
    imageServerPath: 'http://localhost:9004/image',
    imagePhysicalDirectoryName: '',
    imageServerDirectoryName: '',
    comicPhysicalPath: 'E:/CrawlDist/comic',
    comicServerPath: 'http://localhost:9004/image',
    comicPhysicalDirectoryName: '',
    comicServerDirectoryName: ''
  }

  scoreTextTable: any = {
    1: { text: '烂到没亮点', status: true },
    2: { text: '有可取之处的烂', status: true },
    3: { text: '稍微有点烂', status: true },
    4: { text: '一般般', status: true },
    5: { text: '有些亮点', status: true },
    6: { text: '还不错', status: true },
    7: { text: '佳作', status: true },
    8: { text: '精品', status: true },
    9: { text: '极品', status: true },
    10: { text: '神作', status: true }
  }
  scoreTextList: any = [
    '烂到没亮点',
    '有可取之处的烂',
    '稍微有点烂',
    '一般般',
    '有些亮点',
    '还不错',
    '佳作',
    '精品',
    '极品',
    '神作'
  ]

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

  // setGlobalSetting(key: string, value: any) {
  //   if (this.hasOwnProperty(key)) {
  //     let member = this[key as keyof typeof this];
  //     if (typeof member != 'function') {
  //       this[key as keyof typeof this] = value;
  //     }
  //   }
  // }

  setGlobalSetting(key: string, value: any) {
    if (this.globalData.hasOwnProperty(key)) {
      this.globalData[key as keyof typeof this.globalData] = value;
    }
  }

}
