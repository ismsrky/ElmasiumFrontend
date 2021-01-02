import { Component, OnInit, OnDestroy, Host, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { AppComponent } from '../../../../app/app.component';
import { PersonMineSelectComp } from '../../../person/mine/select/select.comp';
import { PersonMineCurrencyComp } from '../../../person/mine/currency/currency.comp';
import { NotificationSmallListIndexComp } from '../../../notification/small/list/index.comp';
import { ApprovalFicheChoiceIndexComp } from '../../../approval/fiche/choice/index.comp';
import { LangSelectComp } from '../../../general/lang-select/lang-select.comp';
import { FicheListItemModalComp } from '../../../fiche/list/item/modal/modal.comp';

// Service
import { ApprovalFicheService } from '../../../../service/approval/fiche.service';
import { PersonService } from '../../../../service/person/person.service';
import { AuthService } from '../../../../service/auth/auth.service';
import { FicheService } from '../../../../service/fiche/fiche.service';
import { PersonRelationService } from '../../../../service/person/relation.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { AppRouterService } from '../../../../service/sys/router.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { MenuDto } from '../../../../dto/menu/menu.dto';
import { CurrenciesDto } from '../../../../dto/enumsOp/currencies.dto';
import { FicheGetCriteriaDto } from '../../../../dto/fiche/get-criteria.dto';
import { ApprovalFicheSaveDto } from '../../../../dto/approval/fiche/save.dto';
import { ApprovalStats } from '../../../../enum/approval/stats.enum';
import { FicheDto } from '../../../../dto/fiche/fiche.dto';
import { PersonNotificationSummaryDto } from '../../../../dto/person/notification-summary.dto';
import { PersonNavMenuDto } from '../../../../dto/person/nav-menu.dto';
import { PersonRelationListDto } from '../../../../dto/person/relation/list.dto';
import { PersonRelationGetListCriteriaDto } from '../../../../dto/person/relation/getlist-criteria.dto';
import { PersonChangeMyPersonDto } from '../../../../dto/person/change-myperson.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';
import { RealPersonBo } from '../../../../bo/person/real/real-person.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { AppRoutes } from '../../../../enum/sys/routes.enum';
import { Genders } from '../../../../enum/person/genders.enum';
import { PersonTypes } from '../../../../enum/person/person-types.enum';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { Stc, expandCollapse } from '../../../../stc';

@Component({
    selector: 'layout-navbar-top',
    templateUrl: './top.comp.html',
    styleUrls: ['./top.comp.css'],
    animations: [expandCollapse],
    host: {
        '(document:tap)': 'onClick($event)',
    }
})
export class LayoutNavbarTopComp implements OnInit, OnDestroy {
    operator: RealPersonBo;
    profile: PersonProfileBo;

    myPersonList: PersonRelationListDto[];
    leftPerson: PersonRelationListDto;
    leftPersonTitle: string = '';

    currencyDto: CurrenciesDto;

    personTypes = PersonTypes;

    @ViewChild(PersonMineSelectComp, { static: false }) childPersonSelectComp: PersonMineSelectComp;
    @ViewChild(PersonMineCurrencyComp, { static: false }) childPersonCurrencyComp: PersonMineCurrencyComp;
    @ViewChild(NotificationSmallListIndexComp, { static: false }) childNotificationList: NotificationSmallListIndexComp;
    @ViewChild(ApprovalFicheChoiceIndexComp, { static: false }) childFicheChoiceComp: ApprovalFicheChoiceIndexComp;
    @ViewChild(LangSelectComp, { static: false }) childLangSelectComp: LangSelectComp;
    @ViewChild(FicheListItemModalComp, { static: false }) childFicheItemModal: FicheListItemModalComp;

    busy: boolean = false;

    subsLogin: Subscription;
    subsLogout: Subscription;
    subsNeedRefresh: Subscription;
    subscriptionRouter: Subscription;
    subscriptionModalClosed: Subscription;
    subscriptionSaveAttempt: Subscription;
    subscriptionOpen: Subscription;
    subsItemSelected: Subscription;

    showNotification = false;
    showApprovalAll = false;
    showUserMenu = false;
    showProfileList = false;
    headerToggled: boolean = false;

    isChoiceModalOpen: boolean = false;
    isLangModalOpen: boolean = false;
    isFicheItemModalOpen: boolean = false;

    navMenuList: PersonNavMenuDto[];

    genders = Genders;

    isProfileModalOpen: boolean = false;
    isCurrencyModalOpen: boolean = false;

    host: AppComponent;

    isRealLogin: boolean = Stc.isRealLogin;

    isNarrow: boolean = true;

    appRoutes = AppRoutes;
    constructor(
        @Host() host: AppComponent,
        private personRelationService: PersonRelationService,
        private ficheService: FicheService,
        private _eref: ElementRef,
        private compBroadCastService: CompBroadCastService,
        private authService: AuthService,
        private localStorageService: LocalStorageService,
        private personService: PersonService,
        private appRouterService: AppRouterService,
        private approvalFicheService: ApprovalFicheService,
        private route: Router,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private dicService: DictionaryService,
        private titleService: Title) {
        this.host = host;

        this.operator = null;
        this.profile = null;
        this.currencyDto = null;

        this.routeEvent(this.route);

        this.notificationSummaryDto = Stc.notificationSummaryDto;

        this.profile = this.localStorageService.personProfile;
        this.setTitle();
    }

    setTitle(): void {
        if (this.profile.PersonId > 0) {
            this.titleService.setTitle('Elmasium - ' + this.profile.FullName);
        } else {
            this.titleService.setTitle('Elmasium');
        }
    }

    ngOnInit(): void {
        this.isNarrow = window.innerWidth <= 768;

        this.subsLogin = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Login).subscribe(
            x => {
                scroll(0, 0);

                this.checkIsRealLogin();

                this.arrangeMenu();
                this.operator = this.localStorageService.realPerson;
                this.profile = this.localStorageService.personProfile;
                this.setTitle();
                this.currencyDto = Stc.currenciesDto.find(f => f.Id == this.profile.SelectedCurrencyId);

                this.init();
            });

        this.subsLogout = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Logout).subscribe(
            x => {
                this.navMenuList = null;
                this.busy = false;
                this.isRealLogin = false;

                //this.init();
            });

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'PersonMenu') {
                    this.arrangeMenu();
                } else if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                    this.currencyDto = Stc.currenciesDto.find(f => f.Id == this.profile.SelectedCurrencyId);

                    this.setTitle();

                    this.arrangeMenu();
                } else if (x == 'PersonNotificationSummary') {
                    this.notificationSummaryDto = Stc.notificationSummaryDto;
                }
            }
        );

        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'PersonMineSelect') {
                    this.isProfileModalOpen = false;
                } else if (x == 'PersonMineCurrency') {
                    this.isCurrencyModalOpen = false;
                } else if (x == 'ApprovalFicheChoice') {
                    this.isChoiceModalOpen = false;
                } else if (x == 'LangSelect') {
                    this.isLangModalOpen = false;
                } else if (x == 'FicheListItemModalComp') {
                    this.isFicheItemModalOpen = false;
                }
            });
        this.subscriptionSaveAttempt = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.SaveAttempt).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('ApprovalFicheSaveAttempt')) {
                        const ficheId: number = JSON.parse(x).ApprovalFicheSaveAttempt.ficheId;
                        const approvalStatId: ApprovalStats = JSON.parse(x).ApprovalFicheSaveAttempt.approvalStatId;
                        const ficheApprovalStatId: ApprovalStats = JSON.parse(x).ApprovalFicheSaveAttempt.ficheApprovalStatId;

                        this.approvalFicheSave(ficheId, approvalStatId, ficheApprovalStatId);
                    }
                }
            }
        );
        this.subscriptionOpen = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Open).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('FicheListItemModalComp')) {
                        const ficheId: number = JSON.parse(x).FicheListItemModalComp.ficheId;

                        this.openFiche(ficheId);
                    }
                }
            }
        );
        this.subsItemSelected = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('myPersonChanged')) {
                        const selectedProfileId: number = JSON.parse(x).myPersonChanged.selectedProfileId;
                        const selectedProfile = this.myPersonList.find(f => f.RelatedPersonId == selectedProfileId);
                        if (this.utils.isNotNull(selectedProfile)) {
                            this.myPersonChanged(selectedProfile);
                        }
                    }
                }
            }
        );

        this.init();
    }

    init(): void {
        this.operator = this.localStorageService.realPerson;
        this.profile = this.localStorageService.personProfile;
        this.arrangeMenu();

        this.setTitle();

        this.loadMyPersons();

        setTimeout(() => {
            this.currencyDto = Stc.currenciesDto.find(f => f.Id == this.profile.SelectedCurrencyId);
        }, 1500);
    }

    ngOnDestroy(): void {
        this.utils.unsubs(this.subsLogin);
        this.utils.unsubs(this.subsLogout);
        this.utils.unsubs(this.subsNeedRefresh);

        this.utils.unsubs(this.subscriptionRouter);

        this.utils.unsubs(this.subscriptionModalClosed);
        this.utils.unsubs(this.subsItemSelected);


        this.navMenuList = null;
        Stc.navMenuList = null;

        this.utils.unsubs(this.subscriptionSaveAttempt);
        this.utils.unsubs(this.subscriptionOpen);
    }

    leftPersonClick(): void {
        this.showProfileList = false;
        this.showApprovalAll = false;
        this.showNotification = false;
        this.showUserMenu = false;

        if (this.myPersonList.length > 1) {
            if (this.isNarrow) {
                this.openProfileModal();
            } else {
                this.showProfileList = !this.showProfileList;
            }
        } else {
            this.myPersonChanged(this.leftPerson);
        }
    }

    myPersonChanged(selectedPerson: PersonRelationListDto): void {
        if (this.utils.isNull(selectedPerson)) return;

        const personProfile = new PersonProfileBo();
        personProfile.PersonId = selectedPerson.RelatedPersonId;
        personProfile.PersonTypeId = selectedPerson.RelatedPersonTypeId;
        personProfile.FullName = selectedPerson.RelatedPersonFullName;
        personProfile.DefaultCurrencyId = selectedPerson.RelatedPersonDefaultCurrencyId;
        personProfile.SelectedCurrencyId = personProfile.DefaultCurrencyId;
        personProfile.UrlName = selectedPerson.RelatedPersonUrlName;

        personProfile.RelationTypeIdList = [];
        let i: number = 0;
        selectedPerson.RelationSubList.forEach(element => {
            i++;
            personProfile.RelationTypeIdList.push(element.RelationTypeId);

            if (i == selectedPerson.RelationSubList.length) {
                const changeMyPersonDto = new PersonChangeMyPersonDto();
                changeMyPersonDto.MyPersonId = selectedPerson.RelatedPersonId;
                changeMyPersonDto.DefaultCurrencyId = selectedPerson.RelatedPersonDefaultCurrencyId;
                changeMyPersonDto.PersonRelationId = selectedPerson.Id;

                let subs = this.personService.changeMyPerson(changeMyPersonDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);

                        if (x.IsSuccess) {
                            this.localStorageService.setPersonProfile(personProfile);

                            setTimeout(() => {
                                this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'ProfileChanged');

                                setTimeout(() => {
                                    this.appRouterService.navigate(AppRoutes.homepage);

                                    this.init();

                                    this.handlePersons();
                                });
                            });
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'myPersonChanged', subs);
                    }
                );
            }
        });
    }

    handlePersons(): void {
        if (this.utils.isNotNull(this.myPersonList) && this.myPersonList.length == 1) {
            if (this.profile.PersonId == this.operator.Id) {
                this.leftPerson = this.myPersonList[1];
            } else {
                this.leftPerson = this.myPersonList[0];
            }

            let found: boolean = false;
            this.myPersonList.forEach(element => {
                if (!found && this.profile.PersonId == this.operator.Id && element.RelatedPersonId != this.operator.Id) {
                    this.leftPerson = element;
                    found = true;
                } else if (!found && this.profile.PersonId != this.operator.Id && element.RelatedPersonId == this.operator.Id) {
                    this.leftPerson = element;
                    found = true;
                }
            });

            if (this.leftPerson.RelatedPersonTypeId == PersonTypes.xRealPerson) {
                this.leftPersonTitle = 'xIndividual';
            } else if (this.leftPerson.RelatedPersonTypeId == PersonTypes.xShop) {
                this.leftPersonTitle = 'xMyShop';
            }
        } else if (this.utils.isNotNull(this.myPersonList) && this.myPersonList.length > 1) {
            this.leftPerson = null;

            this.leftPersonTitle = 'xOtherProfiles';
        }
    }

    loadMyPersons(): void {
        const criteriaDto = new PersonRelationGetListCriteriaDto();
        criteriaDto.PersonId = this.localStorageService.realPerson.Id;

        criteriaDto.CurrencyId = this.localStorageService.personProfile.SelectedCurrencyId;

        criteriaDto.RelationTypeIdList = this.utils.getMyPersonRelationList();

        this.myPersonList = [];
        this.leftPerson = null;
        this.busy = true;
        let subs = this.personRelationService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess && this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                    let i: number = 0;

                    if (this.profile.PersonId != this.operator.Id) {
                        let newElement = new PersonRelationListDto(this.dicService);
                        newElement.copy(x.Dto.find(f => f.RelatedPersonId == this.localStorageService.realPerson.Id));
                        newElement.handleRelationTypes();

                        this.myPersonList.push(newElement);
                    }

                    x.Dto.forEach(element => {
                        i++;

                        if (this.profile.PersonId != element.RelatedPersonId && this.utils.isNull(this.myPersonList.find(f => f.RelatedPersonId == element.RelatedPersonId))) {
                            let newElement = new PersonRelationListDto(this.dicService);
                            newElement.copy(element);
                            newElement.handleRelationTypes();

                            this.myPersonList.push(newElement);
                        }

                        if (i == x.Dto.length) {
                            this.handlePersons();
                        }
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadMyPersons', subs);
                this.busy = false;
            }
        );
    }

    checkIsRealLogin(): void {
        let subs = this.authService.isRealLogin().subscribe(
            x => {
                this.utils.unsubs(subs);

                this.isRealLogin = x.IsSuccess;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'checkIsRealLogin', subs);
            }
        );
    }

    routeEvent(router: Router): void {
        this.subscriptionRouter = router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                this.activeMenu(e.url);
            }
        });
    }

    notificationSummaryDto: PersonNotificationSummaryDto;

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }

    activeMenu(url: string): void {
        this.showApprovalAll = false;
        this.showNotification = false;
        this.showUserMenu = false;
        this.showProfileList = false;
        this.headerToggled = false;

        if (!this.navMenuList) return;

        //if (window.innerWidth <= 768)
        //  this.host.isToggled = false;

        //if (url == '/')
        //    url = '/Dashboard';

        let found: boolean = false;
        this.navMenuList.forEach(menu => {
            if (menu.SubMenuList) {
                found = false;

                menu.SubMenuList.forEach(subMenu => {
                    if (subMenu.Url == url) {
                        subMenu.Active = true;
                        found = true;
                    } else {
                        subMenu.Active = false;
                    }
                });
            }
        });
    }

    showMenu(menu: MenuDto): void {
        menu.Show = !menu.Show;

        /**
        * I want all submenu comes opened at first.
        * So below code is useless now.
        * Maybe later I change my mind.
        * 
        *  if (menu.Show) {
           this.navMenuList.filter(x => x.Id != menu.Id).forEach(x => {
               x.Show = false;
           });
       }
        */
    }

    sendMenuRefresh(): void {
        setTimeout(() => {
            this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'NavMenuList');
        }, 200);
    }

    arrangeMenu(): void {
        this.busy = true;

        this.navMenuList = null;
        Stc.navMenuList = null;

        let subs = this.authService.isLogin().subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.getNavMenuList();
                } else {
                    this.sendMenuRefresh();
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.sendMenuRefresh();

                this.logExService.saveObservableEx(err, this.constructor.name, 'arrangeMenu', subs);
                this.busy = false;
            }
        );
    }

    getNavMenuList(): void {
        let subs = this.personService.getNavMenuList().subscribe(
            x => {
                this.utils.unsubs(subs);

                let i: number = 0;
                if (x.IsSuccess) {
                    this.navMenuList = x.Dto;
                    Stc.navMenuList = this.navMenuList;

                    this.sendMenuRefresh();

                    this.navMenuList.forEach(element => {
                        i++;
                        //element.Show = true;

                        if (this.navMenuList.length == i) {
                            this.activeMenu(this.route.url);
                        }
                    });
                } else {
                    this.navMenuList = null;
                    Stc.navMenuList = null;

                    this.sendMenuRefresh();

                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getNavMenuList', subs);
            }
        );
    }

    openProfileModal(): void {
        this.isProfileModalOpen = true;

        setTimeout(() => {
            this.childPersonSelectComp.showModal(this.myPersonList);
        }, 200);
    }
    openCurrencyModal(): void {
        this.isCurrencyModalOpen = true;

        setTimeout(() => {
            this.childPersonCurrencyComp.showModal();
        }, 200);
    }
    switchDefaultCurrency(): void {
        const selectedPerson = this.localStorageService.personProfile;

        selectedPerson.SelectedCurrencyId = selectedPerson.DefaultCurrencyId;
        this.localStorageService.setPersonProfile(selectedPerson);

        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'CurrencyChanged');
    }

    onClick(event) {
        if (!this._eref.nativeElement.contains(event.target)) { // or some similar check
            this.showApprovalAll = false;
            this.showNotification = false;
            this.showUserMenu = false;
            this.showProfileList = false;

            this.headerToggled = false;
        }
        /**
         *  if (window.innerWidth <= 768
             && event.target.className != 'app-sidebar') {
             this.host.isToggled = false;
         }
         */
    }

    gotoLogin(): void {
        this.appRouterService.navigate(AppRoutes.login);
    }
    gotoRegister(): void {
        this.appRouterService.navigate(AppRoutes.register);
    }

    addNew(): void {
        this.showApprovalAll = false;
        this.showNotification = false;
        this.showUserMenu = false;
        this.showProfileList = false;

        this.appRouterService.navigate(AppRoutes.generalNew);
    }
    openProfile(): void {
        this.showApprovalAll = false;
        this.showNotification = false;
        this.showUserMenu = false;
        this.showProfileList = false;

        const isMe: boolean = this.localStorageService.realPerson.Id == this.localStorageService.personProfile.PersonId;

        if (isMe) {
            this.appRouterService.navigate(AppRoutes.myProfile);
        } else {
            this.route.navigateByUrl(this.localStorageService.personProfile.UrlName);
        }
    }
    openAddress(): void {
        this.showApprovalAll = false;
        this.showNotification = false;
        this.showUserMenu = false;
        this.showProfileList = false;

        this.appRouterService.navigate(AppRoutes.definitionsAddress);
    }
    openAbout(): void {
        this.showApprovalAll = false;
        this.showNotification = false;
        this.showUserMenu = false;
        this.showProfileList = false;

        this.appRouterService.navigate(AppRoutes.about);
    }

    approvalAllClick(): void {
        this.showApprovalAll = !this.showApprovalAll;

        if (this.showApprovalAll) {
            this.showNotification = false;
            this.showUserMenu = false;
            this.showProfileList = false;

            this.headerToggled = false;
        }
    }
    notificationClick(): void {
        this.showNotification = !this.showNotification;

        if (this.showNotification) {
            this.showApprovalAll = false;
            this.showUserMenu = false;
            this.showProfileList = false;

            this.headerToggled = false;
        }
    }
    userMenuClick(): void {
        this.showUserMenu = !this.showUserMenu;

        if (this.showUserMenu) {
            this.showApprovalAll = false;
            this.showNotification = false;

            this.headerToggled = false;
        }
    }
    openLanguageModal(): void {
        this.isLangModalOpen = true;

        this.showApprovalAll = false;
        this.showNotification = false;
        this.showUserMenu = false;
        this.showProfileList = false;

        setTimeout(() => {
            this.childLangSelectComp.showModal();
        }, 200);
    }

    headerToggleClick(): void {
        this.headerToggled = !this.headerToggled;

        if (this.headerToggled) {
            this.showApprovalAll = false;
            this.showNotification = false;
            this.showUserMenu = false;
            this.showProfileList = false;
        }
    }

    openChoiceModal(fichDto: FicheDto, approvalFicheSaveDto: ApprovalFicheSaveDto): void {
        this.isChoiceModalOpen = true;

        setTimeout(() => {
            let subscribeCloseChoiceModal = this.childFicheChoiceComp.showModal(fichDto, approvalFicheSaveDto).subscribe(
                x => {
                    this.utils.unsubs(subscribeCloseChoiceModal);
                }
            );
        });
    }

    approvalFicheSave(ficheId: number, approvalStatId: ApprovalStats, ficheApprovalStatId: ApprovalStats): void {
        let strText: string = '';

        if (approvalStatId == ApprovalStats.xAccepted) {
            strText = ficheApprovalStatId == ApprovalStats.xPendingDeleted ? 'xConfirmDelete' : 'xConfirmFiche';
        } else if (approvalStatId == ApprovalStats.xRejected) {
            strText = 'xConfirmRejectFiche';
        } else if (approvalStatId == ApprovalStats.xPulledBack) {
            strText = 'xConfirmPullBackFiche';
        }

        this.dialogService.show({
            text: this.dicService.getValue(strText),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const approvalFicheSaveDto: ApprovalFicheSaveDto = new ApprovalFicheSaveDto();
                approvalFicheSaveDto.FicheId = ficheId;
                approvalFicheSaveDto.ApprovalStatId = approvalStatId;

                let subscribeSave = this.approvalFicheService.save(approvalFicheSaveDto).subscribe(
                    x => {
                        this.utils.unsubs(subscribeSave);

                        if (x.IsSuccess) {
                            this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({ 'ApprovalFicheSaved': { 'ficheId': ficheId, 'approvalStatId': approvalStatId } }));

                            this.toastr.success(this.ficheService.getFicheSavedText(approvalStatId));
                        } else if (x.Message == '[NeedChoice]') {

                            // x.ReturnedId gives us the ficheId which processed from server.
                            // FicheId can change if fiche we gave is related fiche.
                            const criteriaDto = new FicheGetCriteriaDto();
                            criteriaDto.MyPersonId = this.profile.PersonId;
                            criteriaDto.FicheId = x.ReturnedId;
                            let subscribeFiche = this.ficheService.get(criteriaDto).subscribe(
                                f => {
                                    this.utils.unsubs(subscribeFiche);

                                    if (f.IsSuccess) {
                                        this.openChoiceModal(f.Dto, approvalFicheSaveDto);
                                    } else {
                                        this.dialogService.showError(f.Message);
                                    }
                                },
                                errF => {
                                    this.utils.unsubs(subscribeFiche);
                                }
                            );
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.utils.unsubs(subscribeSave);

                        this.toastr.error(err);
                    }
                );
            },
            no: () => {
            }
        });
    }

    openFiche(ficheId: number): void {
        this.isFicheItemModalOpen = true;

        setTimeout(() => {
            this.childFicheItemModal.showModal(ficheId);
        }, 200);
    }

    logout(): void {
        // this.busy = true;
        this.showApprovalAll = false;
        this.showNotification = false;
        this.showUserMenu = false;
        this.showProfileList = false;

        let subs = this.authService.logout().subscribe(
            data => {
                this.utils.unsubs(subs);
                // this.busy = false;
                if (data.IsSuccess) {
                    Stc.isRealLogin = false;
                    Stc.isLogin = false;
                    this.localStorageService.clearRealPerson();
                    this.localStorageService.clearPersonProfile();
                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Logout);

                    this.isRealLogin = false;

                    this.appRouterService.navigate(AppRoutes.homepage);
                    //this.toastr.warning(fullName, this.dicService.getValue('xLoggedOut'));
                } else {
                    //this.dialogService.show(data.Message, '', DialogIcons.Warning);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'logout', subs);

                this.localStorageService.clearRealPerson();
                this.localStorageService.clearPersonProfile();

                this.compBroadCastService.sendMessage(CompBroadCastTypes.Logout);

                this.appRouterService.navigate(AppRoutes.homepage);
                //this.toastr.warning(fullName, this.dicService.getValue('xLoggedOut'));
            }
        );
    }
}