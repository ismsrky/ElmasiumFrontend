import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

// Service
import { PersonRelationService } from '../../../../../../service/person/relation.service';
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../../../../service/dictionary/dictionary.service';

// Comp
import { PersonAccountSearchIndexComp } from '../../../search/index.comp';

// Dto
import { PersonAccountActivityGetListCriteriaDto } from '../../../../../../dto/person/account/activity-getlist-criteria.dto';
import { PersonAccountListDto } from '../../../../../../dto/person/account/list.dto';

// Bo
import { PersonAccountSearchShowCriteriaBo } from '../../../../../../bo/person/account/search-show-criteria.bo';
import { PersonProfileBo } from '../../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../../enum/sys/comp-broadcast-types.enum';
import { FicheTypeFakes } from '../../../../../../enum/fiche/type-fakes.enum';
import { ApprovalStats } from '../../../../../../enum/approval/stats.enum';
import { Currencies } from '../../../../../../enum/person/currencies.enum';
import { DateRanges } from '../../../../../../enum/sys/date-ranges.enum';
import { Stc, expandCollapse } from '../../../../../../stc';
import { UtilService } from '../../../../../../service/sys/util.service';
import { CurrencyMaskConfig } from 'ngx-currency';

@Component({
    selector: 'person-account-activity-list-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class PersonAccountActivityListCriteriaComp implements OnInit, OnDestroy {
    profile: PersonProfileBo;

    subsNeedRefresh: Subscription;

    criteriaDto: PersonAccountActivityGetListCriteriaDto;
    insideCriteriaDto: PersonAccountActivityGetListCriteriaDto;

    dateRanges = DateRanges;
    dateRange: DateRanges;

    @ViewChild('criteriaForm', { static: false }) criteriaForm: NgForm;

    @Input('IsInside') IsInside: boolean = false;

    showCriteria: boolean = false;

    showIssueDate: boolean = false;
    showTransaction: boolean = false;
    showApprovalStat: boolean = false;
    showGrandTotal: boolean = false;
    showCurrency: boolean = false;

    @ViewChild(PersonAccountSearchIndexComp, { static: false }) childPersonAccountSearch: PersonAccountSearchIndexComp;

    isPersonAccountSearchModalOpen: boolean = false;
    subscriptionModalClosed: Subscription;

    ficheTypeFakes = FicheTypeFakes;
    currencies = Currencies;

    configCurrency: CurrencyMaskConfig;

    busy: boolean = false;

    constructor(
        private personRelationService: PersonRelationService,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService,
        private dicService: DictionaryService) {
        this.profile = this.localStorageService.personProfile;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.profile.SelectedCurrencyId);
    }

    ngOnInit(): void {
        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'PersonAccountSearch') {
                    this.isPersonAccountSearchModalOpen = false;
                }
            });
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.clear(true);
                }
            }
        );

        setTimeout(() => {
            this.clear(!this.IsInside);
        });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionModalClosed);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    showInside(criteriaDto: PersonAccountActivityGetListCriteriaDto, accountName: string): void {
        this.criteriaDto = criteriaDto;

        this.insideCriteriaDto = new PersonAccountActivityGetListCriteriaDto();
        this.insideCriteriaDto.copy(criteriaDto);

        this.handleApprovalStatus();

        this.dateRange = DateRanges.xToday;
        this.dateRangeChanged();

        this.handleAccountStr(accountName);

        this.search();
    }

    ////// approval status selection //////

    checkedAllApprovalStats: boolean = false;

    checkedPending: boolean = false;
    checkedAccepted: boolean = false;
    checkedRejected: boolean = false;
    checkedPulledBack: boolean = false;
    checkedDeleted: boolean = false;

    approvalStatusChange(search: boolean): void {
        this.criteriaDto.ApprovalStatIdList = [];

        if (this.checkedPending) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPending);
        if (this.checkedAccepted) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xAccepted);
        if (this.checkedRejected) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xRejected);
        if (this.checkedPulledBack) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPulledBack);
        if (this.checkedDeleted) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xDeleted);

        this.checkedAllApprovalStats =
            this.checkedPending
            && this.checkedAccepted
            && this.checkedRejected
            && this.checkedPulledBack;

        if (search)
            this.search();
    }
    handleApprovalStatus(): void {
        this.checkedPending = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xPending);
        this.checkedAccepted = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xAccepted);
        this.checkedRejected = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xRejected);
        this.checkedPulledBack = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xPulledBack);
        this.checkedDeleted = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xDeleted);

        this.checkedAllApprovalStats =
            this.checkedPending
            && this.checkedAccepted
            && this.checkedRejected
            && this.checkedPulledBack;
    }
    ////// approval status selection //////

    search(): void {
        if (this.criteriaDto.GrandTotalMin < 0
            || this.criteriaDto.GrandTotalMax < 0) {
            return;
        }
        this.criteriaDto.IssueDateStartNumber = this.utils.getDateNumber(this.criteriaDto.IssueDateStart);
        this.criteriaDto.IssueDateEndNumber = this.utils.getDateNumber(this.criteriaDto.IssueDateEnd);
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonAccountActivityListCriteria': this.criteriaDto }));
    }

    clear(search): void {
        this.profile = this.localStorageService.personProfile;

        if (this.IsInside && this.utils.isNotNull(this.insideCriteriaDto)) {
            this.criteriaDto.copy(this.insideCriteriaDto);
        }

        if (!this.IsInside) {
            this.criteriaDto = new PersonAccountActivityGetListCriteriaDto();

            // approval status
            this.checkedPending = true;
            this.checkedAccepted = true;
            this.checkedRejected = true;
            this.checkedPulledBack = true;
            this.checkedDeleted = false;
            this.approvalStatusChange(false);

            this.criteriaDto.AccountIdList = [];
            this.preCheckedAccountList = [];

            this.handleAccountStr(null);
        }

        this.criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;
        this.criteriaDto.OwnerPersonId = this.profile.PersonId;

        this.dateRange = DateRanges.xToday;
        this.dateRangeChanged();

        if (search) {
            this.search();
        }
    }

    preCheckedAccountList: PersonAccountListDto[];
    selectPersonAccount(): void {
        if (this.IsInside) return;

        const criteriaBo = new PersonAccountSearchShowCriteriaBo();
        criteriaBo.PersonId = this.criteriaDto.OwnerPersonId;
        criteriaBo.Multiple = true;

        // I purposely did not use this.criteriaDto.AccountIdList and use preCheckedAccountList instead of it.
        criteriaBo.PreCheckedList = this.preCheckedAccountList;

        this.isPersonAccountSearchModalOpen = true;
        setTimeout(() => {
            let subscriptionCloseSearchModal = this.childPersonAccountSearch.showModal(criteriaBo).subscribe(
                x => {
                    this.utils.unsubs(subscriptionCloseSearchModal);

                    this.preCheckedAccountList = x;

                    this.criteriaDto.AccountIdList = [];
                    let i: number = 0;
                    x.forEach(element => {
                        this.criteriaDto.AccountIdList.push(element.Id);
                        i++;

                        if (i == x.length) {
                            this.handleAccountStr(element.Name);
                            this.search();
                        }
                    });

                    if (x.length == 0) {
                        this.handleAccountStr(null);
                        this.search();
                    }
                }
            );
        });
    }

    dateRangeChanged(): void {
        if (this.dateRange == DateRanges.xCustomDate) {
            this.showCriteria = true;
            this.showIssueDate = true;
        } else {
            this.criteriaDto.IssueDateStartNumber = this.utils.getStartDate(this.dateRange);
            this.criteriaDto.IssueDateStart = new Date(this.criteriaDto.IssueDateStartNumber);

            this.criteriaDto.IssueDateEndNumber = this.utils.getNow();
            this.criteriaDto.IssueDateEnd = new Date(this.criteriaDto.IssueDateEndNumber);
        }
    }

    accountsStr: string = '';
    handleAccountStr(otherPersonName: string): void {
        if (this.utils.isNull(this.criteriaDto.AccountIdList) || this.criteriaDto.AccountIdList.length == 0) {
            this.accountsStr = this.dicService.getValue('xAllWallets');
        } else if (this.criteriaDto.AccountIdList.length == 1) {
            this.accountsStr = otherPersonName;
        } else {
            this.accountsStr = this.dicService.getValue('xSelectedWallets') + ': ' + this.criteriaDto.AccountIdList.length;
        }
    }
}