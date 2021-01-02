import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { FicheListIndexComp } from '../fiche/list/index.comp';
import { PageTitleComp } from '../general/page-title/page-title.comp';

// Service
import { ReportPersonService } from '../../service/report/person.service';
import { PersonRelationService } from '../../service/person/relation.service';
import { LocalStorageService } from '../../service/sys/local-storage.service';
import { LogExceptionService } from '../../service/log/exception.service';
import { CompBroadCastService } from '../../service/sys/comp-broadcast-service';
import { DialogService } from '../../service/sys/dialog.service';
import { UtilService } from '../../service/sys/util.service';

// Dto
import { ReportPersonSummaryGetCriteriaDto } from '../../dto/report/person/getsummary-criteria.dto';
import { ReportPersonSummaryDto } from '../../dto/report/person/summary.dto';
import { PersonNotificationSummaryDto } from '../../dto/person/notification-summary.dto';

// Bo
import { PersonProfileBo } from '../../bo/person/profile.bo';

// Enum
import { Currencies } from '../../enum/person/currencies.enum';
import { DateRanges } from '../../enum/sys/date-ranges.enum';
import { PersonTypes } from '../../enum/person/person-types.enum';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { RelationTypes } from '../../enum/person/relation-types.enum';
import { BalanceStats } from '../../enum/person/balance-stats.enum';
import { Stc, expandCollapse } from '../../stc';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.comp.html',
    animations: [expandCollapse]
})
export class DashBoardComp implements OnInit, OnDestroy {
    notificationSummaryDto: PersonNotificationSummaryDto;
    personSummaryDto: ReportPersonSummaryDto;

    profile: PersonProfileBo;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;
    @ViewChild(FicheListIndexComp, { static: false }) childActivities: FicheListIndexComp;

    personId: number;
    currencyId: Currencies;
    dateRange: DateRanges;
    IssueDateStartNumber: number;
    IssueDateEndNumber: number;

    personTypes = PersonTypes;
    balanceStats = BalanceStats;

    busy: boolean = false;

    dateRanges = [];

    subsNeedRefresh: Subscription;

    amIShopOwner: boolean = false;

    showAbout: boolean = false;

    isRealLogin: boolean = false;

    constructor(
        private reportPersonService: ReportPersonService,
        private personRelationService: PersonRelationService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private dialogService: DialogService,
        private compBroadCastService: CompBroadCastService) {
        this.notificationSummaryDto = Stc.notificationSummaryDto;
        this.amIShopOwner = this.personRelationService.hasRelationIn(RelationTypes.xMyShop);

        for (var enumMember in DateRanges) {
            if (!isNaN(parseInt(enumMember, 10)) && parseInt(enumMember, 10) >= 0) {
                this.dateRanges.push({ key: parseInt(enumMember, 10), value: DateRanges[enumMember] });
            }
        }

        this.clear();

        this.checkIsRealLogin();
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x == 'CurrencyChanged') {
                        this.profile = this.localStorageService.personProfile;

                        this.personId = this.profile.PersonId;


                        if (this.personId == -2) {
                            this.checkIsRealLogin();
                        } else {
                            setTimeout(() => {
                                this.currencyId = this.profile.SelectedCurrencyId;

                                this.search();

                                this.childActivities.showTop10();
                            }, 1000);
                        }
                    } else if (x == 'getSummary') {
                        this.getSummary();

                        this.childActivities.showTop10();
                    } else if (x == 'PersonNotificationSummary') {
                        if (this.isRealLogin && (this.notificationSummaryDto.xFicheIncomings != Stc.notificationSummaryDto.xFicheIncomings
                            || this.notificationSummaryDto.xFicheOutgoings != Stc.notificationSummaryDto.xFicheOutgoings)) {
                            this.childActivities.showTop10();
                        }

                        this.notificationSummaryDto = Stc.notificationSummaryDto;
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    dateRangeChanged(): void {
        this.IssueDateStartNumber = this.utils.getStartDate(this.dateRange);

        this.IssueDateEndNumber = this.utils.getNow();
    }

    search(): void {
        this.dateRangeChanged();
        this.getSummary();
    }

    clear(): void {
        this.personSummaryDto = new ReportPersonSummaryDto();

        this.profile = this.localStorageService.personProfile;

        this.dateRange = DateRanges.xToday;
        this.dateRangeChanged();

        this.personId = this.profile.PersonId;
        this.currencyId = this.profile.SelectedCurrencyId;
    }

    getSummary(): void {
        if (!this.isRealLogin) return;
        this.compBroadCastService.sendMessage(CompBroadCastTypes.GoogleAnalytics);

        const criteriaDto = new ReportPersonSummaryGetCriteriaDto();
        criteriaDto.IssueDateStartNumber = this.IssueDateStartNumber;
        criteriaDto.IssueDateEndNumber = this.IssueDateEndNumber;
        criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        this.busy = true;
        let subs = this.reportPersonService.getSummary(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.personSummaryDto = x.Dto;
                    this.personSummaryDto.Balance = this.utils.round(this.personSummaryDto.CreditTotal - this.personSummaryDto.DebtTotal, 2);
                    this.personSummaryDto.BalanceStatId = this.personSummaryDto.Balance < 0 ? BalanceStats.xDebtor : this.personSummaryDto.Balance == 0 ? BalanceStats.xZero : BalanceStats.xCreditor;

                    if (this.personSummaryDto.Balance < 0) {
                        this.personSummaryDto.Balance = Math.abs(this.personSummaryDto.Balance);
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getSummary', subs);
                this.busy = false;
            }
        );
    }

    checkIsRealLogin(): void {
        this.isRealLogin = Stc.isRealLogin;

        if (this.isRealLogin) {
            setTimeout(() => {
                this.getSummary();

                this.childActivities.showTop10();
            });
        }
    }
}