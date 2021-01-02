import { Component, HostListener } from '@angular/core';
import { Subscription, Observable, timer } from 'rxjs';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { Router, NavigationEnd } from '@angular/router';
import { environment } from '../environments/environment';

// Service
import { AuthService } from '../service/auth/auth.service';
import { WsService } from '../service/sys/ws.service';
import { PersonService } from '../service/person/person.service';
import { DialogService } from '../service/sys/dialog.service';
import { LanguageService } from '../service/dictionary/language.service';
import { CompBroadCastService } from '../service/sys/comp-broadcast-service';
import { DictionaryService } from '../service/dictionary/dictionary.service';
import { LocalStorageService } from '../service/sys/local-storage.service';
import { UtilService } from '../service/sys/util.service';
import { EssentialService } from '../service/sys/essential.service';
import { AppRouterService } from '../service/sys/router.service';
import { SysService } from '../service/sys/sys.service';

// Dto
import { LanguageDto } from '../dto/dictionary/language.dto';
import { DictionaryGetListCriteriaDto } from '../dto/dictionary/getlist-criteria.dto';
import { LoginAsAnonymousDto } from '../dto/auth/login-anonymous.dto';
import { SysVersionGetLatestCriteriaDto } from '../dto/sys/version-getlatest-criteria.dto';

// Enum
import { defineLocale } from 'ngx-bootstrap/chronos';
import { trLocale } from 'ngx-bootstrap/locale';
import { enGbLocale } from 'ngx-bootstrap/locale';
import { CompBroadCastTypes } from '../enum/sys/comp-broadcast-types.enum';
import { AppRoutes } from '../enum/sys/routes.enum';
import { Stc, routerAnimation, expandCollapse } from '../stc';

// Do not remove. //
import 'hammerjs';
import { LogExceptionService } from '../service/log/exception.service';

declare var ga: Function;
// Do not remove. //

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [routerAnimation, expandCollapse]
})
export class AppComponent {
  isLogin: boolean = false;
  subsLogin: Subscription;
  subsLogout: Subscription;

  langList: LanguageDto[];

  subsNeedRefresh: Subscription;
  subscriptionGoogleAnalytics: Subscription;

  isOnAir: boolean = false;

  busy: boolean = false;

  getRouteAnimation(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }
  private storageEventListener(event: StorageEvent) {
    if (event.storageArea == localStorage && !this.isFocused) {
      let v;
      try {
        v = JSON.parse(event.newValue);
      }
      catch (e) {
        v = event.newValue;
      }
      location.reload(true);
      //this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'ProfileChanged');
    }
  }

  isScreen992: boolean = true;

  timerReconnect = timer(100, 30000);
  subsReconnect: Subscription;

  timerSendEx = timer(3000, 60000 * 5);
  subsSendEx: Subscription;

  //timerIsLogin = timer(100, 10000);
  //subscriptionIsLogin: Subscription;
  subsRouter: Subscription;

  routeEvent(router: Router): void {
    this.subsRouter = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        if (environment.production) {
          ga('set', 'page', e.url);
          ga('send', 'pageview');
        }
      }
    });
  }

  constructor(
    private utils: UtilService,
    private wsService: WsService,
    private localStorageService: LocalStorageService,
    private compBroadCastService: CompBroadCastService,
    private languageService: LanguageService,
    private essentialService: EssentialService,
    private authService: AuthService,
    private personService: PersonService,
    private sysService: SysService,
    private logExService: LogExceptionService,
    private dialogService: DialogService,
    private dicService: DictionaryService,
    private _localeService: BsLocaleService,
    private appRouterService: AppRouterService,
    private route: Router) {
    this.isScreen992 = window.innerWidth <= 992;

    this.listenMessages();

    // This method causes to reload when user nagivate same url.
    this.route.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.routeEvent(this.route);

    this.checkIsRealLogin();
  }

  langChanged: boolean = false;
  isFocused: boolean = false;

  focusChanged(): void {
    this.isFocused = true;
  }
  blurChanged(): void {
    this.isFocused = false;
  }

  ngOnInit(): void {
    window.addEventListener('focus', this.focusChanged.bind(this), false);
    window.addEventListener('blur', this.blurChanged.bind(this), false);

    window.addEventListener("storage", this.storageEventListener.bind(this));

    this.getDicList();

    this.getLanguageList();


    if (!Stc.isMobile) {
      this.subsReconnect = this.timerReconnect.subscribe(
        x => {
          document.body.style.paddingRight = '0px';

          this.checkVersion();
        }
      );
    }

    this.getIsLogin();

    setTimeout(() => {
      this.checkVersion();
    }, 5000);

    this.subsSendEx = this.timerSendEx.subscribe(
      x => {
        this.sendAllStoredExList();
      }
    );
  }

  ngOnDestroy(): void {
    this.utils.unsubs(this.subsLogin);
    this.utils.unsubs(this.subsLogout);

    this.utils.unsubs(this.subsNeedRefresh);

    this.utils.unsubs(this.subsReconnect);
    this.utils.unsubs(this.subsSendEx);

    //this.utils.unsubs(this.subscriptionIsLogin);
    this.utils.unsubs(this.subsRouter);

    this.utils.unsubs(this.subscriptionGoogleAnalytics);

    window.removeEventListener("storage", this.storageEventListener.bind(this));
    window.removeEventListener('focus', this.focusChanged.bind(this), false);
    window.removeEventListener('blur', this.blurChanged.bind(this), false);
  }

  listenMessages(): void {
    this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
      x => {
        if (x == 'OnAir') {
          this.isOnAir = true;
        } else if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
          this.getNotificationSummary();
          //console.log('geldi bak');
        } else if (x == 'LanguageChanged') {
          this.langChanged = false;
          setTimeout(() => {
            this.langChanged = true;
          });
        } else if (x == 'PendingOrder') {
          if (!this.route.url.includes(AppRoutes.incomingOrders)) {
            this.appRouterService.navigate(AppRoutes.incomingOrders);
          }

          let audio = new Audio();
          audio.src = "../../../assets/sound/incoming_alert.wav";
          audio.load();
          audio.play();
        }
      });

    this.subsLogin = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Login).subscribe(
      message => {
        this.isLogin = true;
        Stc.isLogin = true;

        this.wsService.connect();

        scroll(0, 0);
      });

    this.subsLogout = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Logout).subscribe(
      message => {
        //this.isLogin = false;

        this.wsService.disconnect();

        Stc.isLogin = false;

        this.loginAsAnonymous();
      });

    this.subscriptionGoogleAnalytics = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.GoogleAnalytics).subscribe(
      x => {
        if (environment.production) {
          setTimeout(() => {
            ga('set', 'page', this.route.url);
            ga('send', 'pageview');
          }, 1500);
        }
      });
  }

  getNotificationSummary(): void {
    let subs = this.personService.getNotificationSummary().subscribe(
      x => {
        this.utils.unsubs(subs);

        if (x.IsSuccess) {
          Stc.notificationSummaryDto = x.Dto;
          this.personService.calculateNotifyTotals();

          this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'PersonNotificationSummary');
        } else {
          this.dialogService.showError(x.Message);
        }
      },
      err => {
        this.logExService.saveObservableEx(err, this.constructor.name, 'getNotificationSummary', subs);
      }
    );
  }

  // remove this
  handleSelectedCurrency(): void {
    const selectedPerson = this.localStorageService.personProfile;

    if (this.utils.isNull(selectedPerson)) return;

    if (this.utils.isNull(selectedPerson.SelectedCurrencyId)) {
      selectedPerson.SelectedCurrencyId = selectedPerson.DefaultCurrencyId;
      this.localStorageService.setPersonProfile(selectedPerson);
    }
  }

  getIsLogin(): void {
    let subs = this.authService.isLogin().subscribe(
      x => {
        this.utils.unsubs(subs);

        this.isLogin = x.IsSuccess == true;

        Stc.isLogin = this.isLogin;

        this.handleSelectedCurrency();

        if (this.isLogin) {
          // This method must be here.
          this.essentialService.load();
        }

        if (x.IsSuccess) {
          this.wsService.connect();
        } else {
          //this.localStorageService.clearRealPerson();
          //this.localStorageService.clearPersonProfile();
          this.wsService.disconnect();

          this.loginAsAnonymous();
        }
      },
      err => {
        this.isLogin = false;
        Stc.isLogin = this.isLogin;
        //this.localStorageService.clearRealPerson();
        //this.localStorageService.clearPersonProfile();

        this.logExService.saveObservableEx(err, this.constructor.name, 'getIsLogin', subs);
      }
    );
  }

  loginAsAnonymous(): void {
    const loginAsAnonymousDto = new LoginAsAnonymousDto();
    loginAsAnonymousDto.K958Q8C4JZ4EX8E = 'V5QGCXW49GXA5GMXANJ2RYHA58N3B8NBPDCYJQW67B22ZNJ5WG';
    loginAsAnonymousDto.LanguageId = this.localStorageService.LangId;
    let subs = this.authService.loginAsAnonymous(loginAsAnonymousDto).subscribe(
      x => {
        this.utils.unsubs(subs);

        this.wsService.connect();

        if (x.IsSuccess) {
          this.isLogin = true;
          this.authService.loginHandle(x.Dto, 'anonymous', false);
        } else {
          this.dialogService.showError(x.Message);
        }
      },
      err => {
        this.logExService.saveObservableEx(err, this.constructor.name, 'loginAsAnonymous', subs);
      }
    );
  }

  checkIsRealLogin(): void {
    let subs = this.authService.isRealLogin().subscribe(
      x => {
        this.utils.unsubs(subs);

        Stc.isRealLogin = x.IsSuccess;
      },
      err => {
        this.logExService.saveObservableEx(err, this.constructor.name, 'checkIsRealLogin', subs);
      }
    );
  }

  getDicList(): void {
    const getListDto = new DictionaryGetListCriteriaDto();
    getListDto.ChangeSetID = this.localStorageService.getDicChangeSetId(this.localStorageService.LangId);
    getListDto.LanguageId = this.localStorageService.LangId;

    let subs = this.dicService.getList(getListDto).subscribe(
      x => {
        this.utils.unsubs(subs);

        if (x.IsSuccess) {
          this.langChanged = true;

          if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
            this.localStorageService.setDics(this.localStorageService.LangId, x.Dto);
          }
        } else {
          this.dialogService.showError(x.Message);
        }
      },
      err => {
        this.logExService.saveObservableEx(err, this.constructor.name, 'getDicList', subs);
      }
    );
  }

  getLanguageList(): void {
    let langId: number = this.languageService.BrowserLang.Id;
    let langId_str = localStorage.getItem('langId');
    if (!langId_str) {
      this.localStorageService.LangId = langId;
    }

    let subs = this.languageService.getList().subscribe(
      x => {
        this.utils.unsubs(subs);

        if (x.IsSuccess) {
          this.langList = x.Dto;

          const cultureCode: string = this.langList.find(x => x.Id == langId).CultureCode;
          this._localeService.use(cultureCode);
        } else {
          this.dialogService.showError(x.Message);
        }
      },
      err => {
        this.logExService.saveObservableEx(err, this.constructor.name, 'getLanguageList', subs);
      });
  }

  gettingVersion: boolean = false;
  newVersionCount: number = 0;
  checkVersion(): void {
    if (this.gettingVersion || !Stc.isLogin) return;

    this.gettingVersion = true;
    const criteriaDto = new SysVersionGetLatestCriteriaDto();
    let subs = this.sysService.getLatestVersion(criteriaDto).subscribe(
      x => {
        this.utils.unsubs(subs);

        this.gettingVersion = false;

        if (x.IsSuccess) {
          if (Stc.version != x.Dto.Version) {
            this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'NewVersionReleased': x.Dto }));

            Stc.newVersionReleased = true;

            let audio = new Audio();
            audio.src = "../../../assets/sound/incoming_alert.wav";
            audio.load();
            audio.play();

            this.newVersionCount++;

            if (this.newVersionCount >= 3) {
              location.reload(true);
            }
          }
        } else {
          this.dialogService.showError(x.Message);
        }
      },
      err => {
        this.gettingVersion = false;

        this.logExService.saveObservableEx(err, this.constructor.name, 'checkVersion', subs);
      }
    );
  }

  sendAllStoredExList(): void {
    let subs = this.logExService.saveSendFirst().subscribe(
      x => {
        this.utils.unsubs(subs);

        const list = this.logExService.getLocal();
        if (this.utils.isNull(list) || list.length == 0 || this.utils.isNull(list.find(f => !f.IsSent))) {
          localStorage.removeItem('ExList');
        }

        if (x) {
          this.sendAllStoredExList();
        }
      },
      err => {
        this.logExService.saveObservableEx(err, this.constructor.name, 'sendAllStoredExList', subs);
      }
    );

  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    this.isScreen992 = window.innerWidth <= 992;
  }
}