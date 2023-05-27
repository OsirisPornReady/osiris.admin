import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import {lastValueFrom, map, Observable, Subject, Subscription} from "rxjs";
import {SFSchemaEnumType} from "@delon/form";
import { ComicDownloadMission } from "../../model/ComicDownloadMission";

@Injectable({ providedIn: 'root' })
export class ComicDownloadService {

  constructor(private http: _HttpClient) { }

  downloadMissionMap: Map<number, ComicDownloadMission> = new Map();

  downloadFinishSubject: Subject<any> = new Subject<any>();

}
