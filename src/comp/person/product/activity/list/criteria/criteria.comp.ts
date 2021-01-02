import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Service
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../../service/sys/local-storage.service';
import { DialogService } from '../../../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../../../service/dictionary/dictionary.service';
import { UtilService } from '../../../../../../service/sys/util.service';

// Component
import { PersonProductSearchIndexComp } from '../../../search/index.comp';

// Dto
import { PersonProductActivityGetListCriteriaDto } from '../../../../../../dto/person/product/activity-getlist-criteria.dto';
import { PersonProductListDto } from '../../../../../../dto/person/product/list.dto';

// Bo
import { PersonProductSearchShowCriteriaBo } from '../../../../../../bo/person/product/search-show-criteria.bo';
import { PersonProfileBo } from '../../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../../enum/sys/comp-broadcast-types.enum';
import { FicheTypeFakes } from '../../../../../../enum/fiche/type-fakes.enum';
import { ApprovalStats } from '../../../../../../enum/approval/stats.enum';
import { Currencies } from '../../../../../../enum/person/currencies.enum';
import { DateRanges } from '../../../../../../enum/sys/date-ranges.enum';
import { CurrencyMaskConfig } from 'ngx-currency';
import { expandCollapse } from '../../../../../../stc';

@Component({
    selector: 'person-product-activity-list-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class PersonProductActivityListCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: PersonProductActivityGetListCriteriaDto;
    insideCriteriaDto: PersonProductActivityGetListCriteriaDto;

    @ViewChild(PersonProductSearchIndexComp, { static: false }) childPersonProductSearch: PersonProductSearchIndexComp;

    profile: PersonProfileBo;

    dateRanges = DateRanges;
    dateRange: DateRanges;

    @ViewChild('criteriaForm', { static: false }) criteriaForm: NgForm;
    @Input('IsInside') IsInside: boolean = false;

    showCriteria: boolean = false;

    showIssueDate: boolean = false;
    showTransaction: boolean = false;
    showApprovalStat: boolean = false;
    showQuantity: boolean = false;
    showCurrency: boolean = false;

    isPersonProductSearchModalOpen: boolean = false;
    subscriptionModalClosed: Subscription;

    ficheTypeFakes = FicheTypeFakes;
    currencies = Currencies;

    configQuantity: CurrencyMaskConfig;

    busy: boolean = false;
    subsNeedRefresh: Subscription;

    constructor(
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private utils: UtilService,
        private toastr: ToastrService) {
        this.configQuantity = this.utils.getQuantityMaskOptions();
    }

    ngOnInit(): void {
        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'PersonProductSearch') {
                    this.isPersonProductSearchModalOpen = false;
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

    showInside(criteriaDto: PersonProductActivityGetListCriteriaDto, productName: string): void {
        this.criteriaDto = criteriaDto;

        this.insideCriteriaDto = new PersonProductActivityGetListCriteriaDto();
        this.insideCriteriaDto.copy(criteriaDto);

        this.handleApprovalStatus();

        this.dateRange = DateRanges.xToday;
        this.dateRangeChanged();

        this.handleProductStr(productName);

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

        if (search) {
            this.search();
        }
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
        if (this.criteriaDto.QuantityTotalMin < 0
            || this.criteriaDto.QuantityTotalMax < 0) {
            return;
        }

        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonProductActivityListCriteria': this.criteriaDto }));
    }

    clear(search: boolean): void {
        this.profile = this.localStorageService.personProfile;

        if (this.IsInside && this.utils.isNotNull(this.insideCriteriaDto)) {
            this.criteriaDto.copy(this.insideCriteriaDto);
        }

        if (!this.IsInside) {
            this.criteriaDto = new PersonProductActivityGetListCriteriaDto();

            // approval status
            this.checkedPending = true;
            this.checkedAccepted = true;
            this.checkedRejected = true;
            this.checkedPulledBack = true;
            this.checkedDeleted = false;
            this.approvalStatusChange(false);

            this.criteriaDto.ProductIdList = [];
            this.handleProductStr(null);
        }

        this.criteriaDto.OwnerPersonId = this.profile.PersonId;

        this.dateRange = DateRanges.xToday;
        this.dateRangeChanged();

        if (search) {
            this.search();
        }
    }

    preCheckedProductList: PersonProductListDto[];
    selectPersonProduct(): void {
        if (this.IsInside) return;

        const criteriaBo = new PersonProductSearchShowCriteriaBo();
        criteriaBo.PersonId = this.criteriaDto.OwnerPersonId;
        criteriaBo.Multiple = true;

        // I purposely did not use this.criteriaDto.ProductIdList and use preCheckedProductList instead of it.
        criteriaBo.PreCheckedList = this.preCheckedProductList;

        this.isPersonProductSearchModalOpen = true;
        setTimeout(() => {
            let subscriptionCloseSearchModal = this.childPersonProductSearch.showModal(criteriaBo).subscribe(
                x => {
                    this.utils.unsubs(subscriptionCloseSearchModal);

                    this.preCheckedProductList = x;

                    this.criteriaDto.ProductIdList = [];

                    let i: number = 0;
                    x.forEach(element => {
                        this.criteriaDto.ProductIdList.push(element.ProductId);
                        i++;

                        if (i == x.length) {
                            this.handleProductStr(element.ProductName);
                            this.search();
                        }
                    });

                    if (x.length == 0) {
                        this.handleProductStr(null);
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

    productListStr: string = '';
    handleProductStr(productName: string): void {
        if (this.utils.isNull(this.criteriaDto.ProductIdList) || this.criteriaDto.ProductIdList.length == 0) {
            this.productListStr = this.dicService.getValue('xAllProductsLabors');
        } else if (this.criteriaDto.ProductIdList.length == 1) {
            this.productListStr = productName;
        } else {
            this.productListStr = this.dicService.getValue('xSelectedProductsLabors') + ': ' + this.criteriaDto.ProductIdList.length;
        }
    }
}