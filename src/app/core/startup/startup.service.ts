/* eslint-disable */
import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, MenuService, SettingsService, TitleService } from '@delon/theme';
import { ACLService } from '@delon/acl';
import { Observable, zip, of, catchError, map } from 'rxjs';
import type { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconService } from 'ng-zorro-antd/icon';

import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';

import { SystemSettingService } from '../../service/system-setting/system-setting.service';

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: HttpClient,
    private router: Router,
    private systemSettingService: SystemSettingService
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }


    private viaHttp(resolve: any, reject: any): void { // Observable<void>
      // return this.httpClient.get('assets/tmp/app-data.json').pipe(
      //   catchError((res: NzSafeAny) => {
      //     console.warn(`StartupService.load: Network request failed`, res);
      //     setTimeout(() => this.router.navigateByUrl(`/exception/500`));
      //     return of({});
      //   }),
      //   map((res: NzSafeAny) => {
      //     // Application information: including site name, description, year
      //     this.settingService.setApp(res.app);
      //     // User information: including name, avatar, email address
      //     this.settingService.setUser(res.user);
      //     // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
      //     this.aclService.setFull(true);
      //     // Menu data, https://ng-alain.com/theme/menu
      //     this.menuService.add(res.menu);
      //     // Can be set page suffix title, https://ng-alain.com/theme/title
      //     this.titleService.suffix = res.app.name;
      //   })
      // );


      let appDataTemp = {
        app: {
          name: `ng-alain`,
          description: `Ng-zorro admin panel front-end framework`
        },
        user: {
          name: 'Admin',
          avatar: './assets/tmp/img/avatar.jpg',
          email: 'cipchk@qq.com',
          token: '123456789'
        },
        layout: {
          collapsed: false
        },
        menu: [
          {
            text: '',
            group: false,
            hideInBreadcrumb: true,
            children: [
              {
                text: 'Dashboard',
                link: '/dashboard',
                icon: { type: 'icon', value: 'appstore' }
              },
              {
                text: 'Video Gallery',
                link: '/gallery/video-gallery',
                icon: { type: 'icon', value: 'youtube' }
              },
              {
                text: 'Video Crawl Task',
                link: '/video-manage/video-crawl-task-list-shortcut',
                icon: { type: 'icon', value: 'youtube' }
              },
              {
                text: 'Video Download',
                link: '/video-manage/video-download-task-list-shortcut',
                icon: { type: 'icon', value: 'youtube' }
              },
              {
                text: 'Comic Gallery',
                link: '/gallery/comic-gallery',
                icon: { type: 'icon', value: 'picture' }
              },
              {
                text: 'Comic Crawl Task',
                link: '/comic-manage/comic-crawl-task-list-shortcut',
                icon: { type: 'icon', value: 'picture' }
              },
              {
                text: 'Comic Download',
                link: '/comic-manage/comic-download-task-list-shortcut',
                icon: { type: 'icon', value: 'picture' }
              },
              {
                text: 'Manage',
                link: '',
                icon: { type: 'icon', value: 'apartment' },
                children: [
                  {
                    text: 'Video Manage',
                    link: '',
                    icon: { type: 'icon', value: 'youtube' },
                    children: [
                      {
                        text: 'video',
                        link: '/video-manage/video-list',
                        icon: null
                      },
                      {
                        text: 'Video Crawl Task',
                        link: '/video-manage/video-crawl-task-list',
                        icon: null
                      },
                      {
                        text: 'Video Download',
                        link: '/video-manage/video-download-task-list',
                        icon: null
                      },
                      {
                        text: 'tag',
                        link: '/video-manage/video-tag-list',
                        icon: null
                      },
                      {
                        text: 'type',
                        link: '/video-manage/video-type-list',
                        icon: null
                      },
                      {
                        text: 'quality',
                        link: '/video-manage/video-quality-list',
                        icon: null
                      },
                      {
                        text: 'video album',
                        link: '/video-manage/video-album-list',
                        icon: null
                      }
                    ]
                  },
                  {
                    text: 'Comic Manage',
                    link: '',
                    icon: { type: 'icon', value: 'picture' },
                    children: [
                      {
                        text: 'comic',
                        link: '/comic-manage/comic-list',
                        icon: null
                      },
                      {
                        text: 'Comic Crawl Task',
                        link: '/comic-manage/comic-crawl-task-list',
                        icon: null
                      },
                      {
                        text: 'Comic Download',
                        link: '/comic-manage/comic-download-task-list',
                        icon: null
                      },
                      {
                        text: 'comic album',
                        link: '/comic-manage/comic-album-list',
                        icon: null
                      }
                    ]
                  },
                  {
                    text: 'Cast Manage',
                    link: '',
                    icon: { type: 'icon', value: 'woman' },
                    children: [
                      {
                        text: 'cast',
                        link: '/cast-manage/cast-list',
                        icon: null
                      }
                    ]
                  },
                  {
                    text: 'System Manage',
                    link: '',
                    icon: { type: 'icon', value: 'setting' },
                    children: [
                      {
                        text: 'setting',
                        link: '/system-manage/system-setting',
                        icon: null
                      },
                      {
                        text: 'crawl',
                        link: '/system-manage/crawl-list',
                        icon: null
                      },
                      {
                        text: 'area',
                        link: '/system-manage/area-list',
                        icon: null
                      }
                    ]
                  }
                ]
              },
            ]
          }
        ]
      };

      let url = 'api/common/init';
      zip(this.httpClient.get(url))
        .pipe(
          catchError((res: any) => {
            console.warn(`StartupService.load: Network request failed`, res);
            // setTimeout(() => this.router.navigateByUrl(`/exception/500`));
            resolve(null);
            return [];
          })
        )
        .subscribe({
          next: async (appData: NzSafeAny) => { //最好直接在初始化接口里返回,别再async await请求一次了
            // setting language data
            // this.i18n.use(defaultLang, langData);
            appData = appDataTemp;
            // Application data
            // Application information: including site name, description, year
            this.settingService.setApp(appData.app);
            // User information: including name, avatar, email address
            this.settingService.setUser(appData.user);
            // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
            this.aclService.setFull(true);

            // 菜单不折叠
            this.settingService.setLayout('collapsed', false);

            // Menu data, https://ng-alain.com/theme/menu
            this.menuService.add(appData.menu);
            // Can be set page suffix title, https://ng-alain.com/theme/title
            this.titleService.suffix = appData.app.name;

            await this.systemSettingService.loadGlobalSettings(); //可以优化成放在init接口里获取数据
          },
          error: () => {},
          complete: () => {
            resolve(null); //无论请求是否成功都要resolve，否则应用无法启动
          }
        });

    }



  private viaMock(): Observable<void> {
    // const tokenData = this.tokenService.get();
    // if (!tokenData.token) {
    //   this.router.navigateByUrl(this.tokenService.login_url!);
    //   return;
    // }
    // mock
    const app: any = {
      name: `ng-alain`,
      description: `Ng-zorro admin panel front-end framework`
    };
    const user: any = {
      name: 'Admin',
      avatar: './assets/tmp/img/avatar.jpg',
      email: 'cipchk@qq.com',
      token: '123456789'
    };
    // Application information: including site name, description, year
    this.settingService.setApp(app);
    // User information: including name, avatar, email address
    this.settingService.setUser(user);
    // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
    this.aclService.setFull(true);
    // Menu data, https://ng-alain.com/theme/menu
    this.menuService.add([
      {
        text: 'Main',
        group: true,
        children: [
          {
            text: 'Dashboard',
            link: '/dashboard',
            icon: { type: 'icon', value: 'appstore' }
          }
        ]
      }
    ]);
    // Can be set page suffix title, https://ng-alain.com/theme/title
    this.titleService.suffix = app.name;

    return of(void 0);
  }

  load(): Promise<any> { // Observable<void>
    // http
    // return this.viaHttp();
    // mock: Don’t use it in a production environment. ViaMock is just to simulate some data to make the scaffolding work normally
    // mock：请勿在生产环境中这么使用，viaMock 单纯只是为了模拟一些数据使脚手架一开始能正常运行
    // return this.viaMock();
    return new Promise((resolve, reject) => {
      this.viaHttp(resolve, reject);
    });
  }
}
