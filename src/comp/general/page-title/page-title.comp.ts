import { Component, Input, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

// Comp
import { AuthVerifyEmailComp } from '../../auth/verify-email/verify-email.comp';

// Service
import { AuthService } from '../../../service/auth/auth.service';
import { HelpService } from '../../../service/help/help.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { HelpListDto } from '../../../dto/help/list.dto';
import { HelpGetListCriteriaDto } from '../../../dto/help/getlist-criteria.dto';

// Bo
import { PageTitleInfoBo } from '../../../bo/general/page-title-info.bo';
import { RealPersonBo } from '../../../bo/person/real/real-person.bo';
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { ApplicationTypes } from '../../../enum/sys/app-types.enum';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { Stc, expandCollapse } from '../../../stc';
import { SysVersionDto } from '../../../dto/sys/version.dto';

@Component({
    selector: 'page-title',
    templateUrl: './page-title.comp.html',
    styleUrls: ['./page-title.comp.css'],
    animations: [expandCollapse],
    host: { '(window:keydown)': 'hotkeys($event)' }
})
export class PageTitleComp implements OnInit, OnDestroy {
    infoBo: PageTitleInfoBo;
    helpList: HelpListDto[];

    latestVersion: SysVersionDto = null;
    newVersionReleased: boolean = Stc.newVersionReleased;

    @ViewChild(AuthVerifyEmailComp, { static: false }) childVerifyEmailComp: AuthVerifyEmailComp;

    @Input('helpName') helpName: string = null;
    @Input('icon') icon: string = null;
    @Input('title') title: string = null;
    @Input('iconColor') iconColor: string = null;
    @Input('isTest') isTest: boolean = false;

    isHelpOpen: boolean = false;
    isVerifyEmailOpen: boolean = false;

    isEmailVerified: boolean = true;

    subscriptionModalClosed: Subscription;
    subsNeedRefresh: Subscription;

    operator: RealPersonBo;
    profile: PersonProfileBo;

    isNarrow: boolean = true;

    busy: boolean = false;

    constructor(
        private authService: AuthService,
        private helpService: HelpService,
        private localStorageService: LocalStorageService,
        private dialogService: DialogService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private sanitizer: DomSanitizer) {
        this.operator = this.localStorageService.realPerson;
        this.profile = this.localStorageService.personProfile;

        this.infoBo = new PageTitleInfoBo();

        this.isNarrow = window.innerWidth <= 768;

        // I wrote following code to prevent freezing when help sections open.
        setTimeout(() => {
            this.loadData();
        }, 400);
    }
    @HostListener('window:scroll', ['$event']) // for window scroll events
    onScroll(event) {
        if (window.matchMedia('(min-width: 768px)').matches) {
            this.fixedScroll = window.scrollY >= 70;
        }
    }
    fixedScroll: boolean = false;
    ngOnInit(): void {
        setTimeout(() => {
            this.checkIsEmailVerified();
        }, 1000);

        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'AuthVerifyEmailComp') {
                    this.isVerifyEmailOpen = false;
                }
            });
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.operator = this.localStorageService.realPerson;
                    this.profile = this.localStorageService.personProfile;
                } else if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('NewVersionReleased')) {
                        this.latestVersion = JSON.parse(x).NewVersionReleased;
                    }
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionModalClosed);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    setInfoBo(infoBo: PageTitleInfoBo): void {
        this.infoBo = infoBo;
        this.helpName = this.infoBo.HelpName;
        this.icon = this.infoBo.Icon;
        this.title = this.infoBo.Title;
        this.iconColor = this.infoBo.IconColor;
    }

    toggleHelp(): void {
        this.isHelpOpen = !this.isHelpOpen;

        // only one page title can be open at a time.
        Stc.isHelpOpen = this.isHelpOpen;

        if (this.isHelpOpen) {
            this.loadData();
        }
    }

    loadData(): void {
        if (!Stc.isLogin) return;

        const criteriaDto = new HelpGetListCriteriaDto();
        criteriaDto.ApplicationTypeId = ApplicationTypes.Angular;
        criteriaDto.Name = this.helpName;

        this.busy = true;
        let subs = this.helpService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.helpList = x.Dto;

                    if (this.utils.isNotNull(this.helpList) && this.helpList.length > 0) {
                        this.helpList.forEach(element => {
                            if (this.utils.isNotNull(element.VideoUrl)) {
                                element.SafeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(element.VideoUrl);
                            }
                        });
                    }

                    /**
                     *  if (this.utils.isNotNull(this.helpList) && this.helpList.length > 0) {
                         this.helpList.forEach(element => {
                             element.Text = this.sanitizer.bypassSecurityTrustHtml(element.Text);
                         });
                     }
                     */
                    //this.html = this.sanitizer.bypassSecurityTrustHtml(this.html);
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    hotkeys(event) {
        switch (event.keyCode) {
            case 112: // F1
                this.toggleHelp();
                return false;
        }
    }

    openVerifyEmail(): void {
        this.isVerifyEmailOpen = true;

        setTimeout(() => {
            this.childVerifyEmailComp.showModal();
        });
    }
    checkIsEmailVerified(): void {
        let subs = this.authService.isEmailVerified().subscribe(
            x => {
                this.utils.unsubs(subs);

                this.isEmailVerified = x.IsSuccess;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'checkIsEmailVerified', subs);
            }
        );
    }

    forceRefresh(): void {
        location.reload(true);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }

    goUp(): void {
        scroll(0, 0);
    }
}