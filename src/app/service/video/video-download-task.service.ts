import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {finalize, lastValueFrom, map, Observable, Subject, Subscription} from "rxjs";
import {SFSchemaEnumType} from "@delon/form";
import { VideoDownloadMission } from "../../model/VideoDownloadMission";
import { NzMessageService } from "ng-zorro-antd/message";

import { VideoService } from './video.service';
import { CrawlService } from "../crawl/crawl.service";


@Injectable({ providedIn: 'root' })
export class VideoDownloadTaskService {

  constructor(
    private http: _HttpClient,
    private videoService: VideoService,
    private crawlService: CrawlService,
    private msgSrv: NzMessageService
  ) { }

  downloadMissionMap: Map<string, boolean> = new Map();
  videoDownloadTaskList: VideoDownloadMission[] = [];
  downloadFinishSubject: Subject<any> = new Subject<any>();

}
