import { Component, OnInit, ViewChild, OnDestroy, Host, Input } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

// Comp
import { PersonSearchIndexComp } from '../../../person/search/index.comp';

// Service
import { PersonRelationService } from '../../../../service/person/relation.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { FicheGetListCriteriaDto } from '../../../../dto/fiche/getlist-criteria.dto';
import { PersonRelationListDto } from '../../../../dto/person/relation/list.dto';
import { FicheTypeFakeDto } from '../../../../dto/fiche/type-fake.dto';

// Bo
import { PersonSearchShowCriteriaBo } from '../../../../bo/person/search-show-criteria.bo';
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { FicheTypes } from '../../../../enum/fiche/types.enum';
import { FicheTypeFakes } from '../../../../enum/fiche/type-fakes.enum';
import { ApprovalStats } from '../../../../enum/approval/stats.enum';
import { Currencies } from '../../../../enum/person/currencies.enum';
import { DateRanges } from '../../../../enum/sys/date-ranges.enum';
import { PaymentStats } from '../../../../enum/fiche/payment-stats.enum';
import { Stc, expandCollapse } from '../../../../stc';
import { debounceTime } from 'rxjs/operators';
import { CurrencyMaskConfig } from 'ngx-currency';

@Component({
    selector: 'fiche-list-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class FicheListCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: FicheGetListCriteriaDto;
    insideCriteriaDto: FicheGetListCriteriaDto;

    dateRanges = DateRanges;
    dateRange: DateRanges;

    @ViewChild('criteriaForm', { static: false }) criteriaForm: NgForm;

    @Input('IsInside') IsInside: boolean = false;

    showCriteria: boolean = false;

    showCredit: boolean = false;
    showDebt: boolean = false;
    showIssueDate: boolean = false;
    showApprovalStat: boolean = false;
    showGrandTotal: boolean = false;
    showPaymentStat: boolean = false;
    showPrintedCode: boolean = false;

    checkedOtherPersonsList: PersonRelationListDto[];

    @ViewChild(PersonSearchIndexComp, { static: false }) childPersonSearch: PersonSearchIndexComp;

    isPersonSearchModalOpen: boolean = false;
    modalClosedSubscription: Subscription;

    subscriptionNameModelChange: Subscription;

    selectedFakeIdList: number[];
    ficheTypeFakeDtoList: FicheTypeFakeDto[];

    ficheTypeFakes = FicheTypeFakes;
    currencies = Currencies;

    paymentStats = PaymentStats;

    busy: boolean = false;

    printedCodeControl = new FormControl();

    profile: PersonProfileBo;

    configCurrency: CurrencyMaskConfig;

    subsNeedRefresh: Subscription;

    constructor(
        private personRelationService: PersonRelationService,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private utils: UtilService,
        private toastr: ToastrService) {
        this.profile = this.localStorageService.personProfile;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.profile.SelectedCurrencyId);
    }

    ngOnInit(): void {
        this.modalClosedSubscription = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'PersonSearch') {
                    this.isPersonSearchModalOpen = false;
                }
            });
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.clear(true);
                }
            }
        );

        this.subscriptionNameModelChange = this.printedCodeControl.valueChanges.pipe(
            debounceTime(Stc.typingEndTime)
        ).subscribe(newValue => {
            this.criteriaDto.PrintedCode = newValue;
            this.search();
        });

        setTimeout(() => {
            this.clear(!this.IsInside);
        });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.modalClosedSubscription);
        this.utils.unsubs(this.subscriptionNameModelChange);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    ////// fiche fake type selection //////
    ficheTypeFakeChange(search: boolean = true) {
        this.criteriaDto.FicheTypeFakeIdList = [];

        if (this.checkedPurchaseInvoice) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xPurchaseInvoice);
        if (this.checkedPurchaseReceipt) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xPurchaseReceipt);
        if (this.checkedIncomingPayment) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xIncomingPayment);
        if (this.checkedIncomingMoney) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xIncomingMoney);
        if (this.checkedSaleReturnReceipt) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xSaleReturnReceipt);
        if (this.checkedSaleReturnInvoice) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xSaleReturnInvoice);
        if (this.checkedCredited) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xCredited);

        if (this.checkedSaleReceipt) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xSaleReceipt);
        if (this.checkedSaleInvoice) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xSaleInvoice);
        if (this.checkedOutgoingPayment) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xOutgoingPayment);
        if (this.checkedOutgoingMoney) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xOutgoingMoney);
        if (this.checkedPurchaseReturnReceipt) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xPurchaseReturnReceipt);
        if (this.checkedPurchaseReturnInvoice) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xPurchaseReturnInvoice);
        if (this.checkedDebted) this.criteriaDto.FicheTypeFakeIdList.push(FicheTypeFakes.xDebted);

        this.checkedAllCredit =
            this.checkedSaleReceipt
            && this.checkedSaleInvoice
            && this.checkedOutgoingPayment
            && this.checkedOutgoingMoney
            && this.checkedPurchaseReturnReceipt
            && this.checkedPurchaseReturnInvoice
            && this.checkedDebted;

        this.checkedAllDebt =
            this.checkedPurchaseInvoice
            && this.checkedPurchaseReceipt
            && this.checkedIncomingPayment
            && this.checkedIncomingMoney
            && this.checkedSaleReturnReceipt
            && this.checkedSaleReturnInvoice
            && this.checkedCredited;

        if (search)
            this.search();
    }
    handleFicheTypeFakes(): void {
        if (this.utils.isNull(this.criteriaDto.FicheTypeFakeIdList))
            this.criteriaDto.FicheTypeFakeIdList = [];

        this.checkedPurchaseInvoice = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xPurchaseInvoice);
        this.checkedPurchaseReceipt = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xPurchaseReceipt);
        this.checkedIncomingPayment = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xIncomingPayment);
        this.checkedIncomingMoney = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xIncomingMoney);
        this.checkedSaleReturnReceipt = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xSaleReturnReceipt);
        this.checkedSaleReturnInvoice = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xSaleReturnInvoice);
        this.checkedCredited = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xCredited);

        this.checkedSaleReceipt = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xSaleReceipt);
        this.checkedSaleInvoice = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xSaleInvoice);
        this.checkedOutgoingPayment = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xOutgoingPayment);
        this.checkedOutgoingMoney = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xOutgoingMoney);
        this.checkedPurchaseReturnReceipt = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xPurchaseReturnReceipt);
        this.checkedPurchaseReturnInvoice = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xPurchaseReturnInvoice);
        this.checkedDebted = this.criteriaDto.FicheTypeFakeIdList.includes(FicheTypeFakes.xDebted);
    }

    checkedAllCredit: boolean = false;
    checkedAllDebt: boolean = false;

    // debt
    checkedPurchaseInvoice: boolean = false;
    checkedPurchaseReceipt: boolean = false;
    checkedIncomingPayment: boolean = false;
    checkedIncomingMoney: boolean = false;
    checkedSaleReturnReceipt: boolean = false;
    checkedSaleReturnInvoice: boolean = false;
    checkedCredited: boolean = false;

    // credit
    checkedSaleReceipt: boolean = false;
    checkedSaleInvoice: boolean = false;
    checkedOutgoingPayment: boolean = false;
    checkedOutgoingMoney: boolean = false;
    checkedPurchaseReturnReceipt: boolean = false;
    checkedPurchaseReturnInvoice: boolean = false;
    checkedDebted: boolean = false;

    selectAllFicheTypeFake(isDebt: boolean, checked: boolean): void {
        if (isDebt) {
            this.checkedPurchaseInvoice = checked;
            this.checkedPurchaseReceipt = checked;
            this.checkedIncomingPayment = checked;
            this.checkedIncomingMoney = checked;
            this.checkedSaleReturnReceipt = checked;
            this.checkedSaleReturnInvoice = checked;
            this.checkedCredited = checked;
        } else {
            this.checkedSaleReceipt = checked;
            this.checkedSaleInvoice = checked;
            this.checkedOutgoingPayment = checked;
            this.checkedOutgoingMoney = checked;
            this.checkedPurchaseReturnReceipt = checked;
            this.checkedPurchaseReturnInvoice = checked;
            this.checkedDebted = checked;
        }

        this.ficheTypeFakeChange(false);
    }
    ////// fiche fake type selection //////

    ////// approval status selection //////

    checkedPending: boolean = false;
    checkedAccepted: boolean = false;
    checkedRejected: boolean = false;
    checkedPulledBack: boolean = false;
    checkedDeleted: boolean = false;
    checkedUncompleted: boolean = false;

    approvalStatusChange(search): void {
        this.criteriaDto.ApprovalStatIdList = [];

        if (this.checkedPending) {
            this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPending);
            this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPendingDeleted);
        }
        if (this.checkedAccepted) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xAccepted);
        if (this.checkedRejected) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xRejected);
        if (this.checkedPulledBack) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPulledBack);
        if (this.checkedDeleted) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xDeleted);
        if (this.checkedUncompleted) this.criteriaDto.ApprovalStatIdList.push(ApprovalStats.xUncompleted);

        if (search)
            this.search();
    }
    handleApprovalStatus(): void {
        if (this.utils.isNull(this.criteriaDto.ApprovalStatIdList))
            this.criteriaDto.ApprovalStatIdList = [];

        this.checkedPending = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xPending) || this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xPendingDeleted);
        this.checkedAccepted = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xAccepted);
        this.checkedRejected = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xRejected);
        this.checkedPulledBack = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xPulledBack);
        this.checkedDeleted = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xDeleted);
        this.checkedUncompleted = this.criteriaDto.ApprovalStatIdList.includes(ApprovalStats.xUncompleted);
    }
    ////// approval status selection //////

    search(): void {
        if (this.criteriaDto.GrandTotalMin < 0
            || this.criteriaDto.GrandTotalMax < 0) {
            return;
        }

        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'FicheListCriteria': this.criteriaDto }));
    }

    clear(search: boolean): void {
        this.profile = this.localStorageService.personProfile;

        if (this.IsInside && this.utils.isNotNull(this.insideCriteriaDto)) {
            this.criteriaDto.copy(this.insideCriteriaDto);
        }

        if (!this.IsInside) {
            this.criteriaDto = new FicheGetListCriteriaDto();

            this.criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

            // fiche types
            this.selectAllFicheTypeFake(true, true);
            this.selectAllFicheTypeFake(false, true);

            // approval status
            this.checkedPending = true;
            this.checkedAccepted = true;
            this.checkedRejected = true;
            this.checkedPulledBack = true;
            this.checkedUncompleted = true;
            this.checkedDeleted = false;
            this.approvalStatusChange(false);

            this.ficheTypeFakeDtoList = [];
            this.selectedFakeIdList = [];

            if (!this.IsInside) {
                this.checkedOtherPersonsList = [];
                this.handleOtherConnectionStr(null);
            }

            Stc.ficheTypeFakeDto.forEach(element => {
                element.Name = this.dicService.getValue(FicheTypeFakes[element.Id]);
                element.FicheTypeName = this.dicService.getValue(FicheTypes[element.FicheTypeId]);

                this.ficheTypeFakeDtoList.push(element);
            });

            this.criteriaDto.PrintedCode = null;
        }

        this.criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        this.dateRange = DateRanges.xToday;
        this.dateRangeChanged();

        if (search) {
            setTimeout(() => {
                this.search();
            }, 100);
        }
    }

    otherConnectionsStr: string = '';
    handleOtherConnectionStr(otherPersonName: string): void {
        if (this.utils.isNull(this.criteriaDto.OtherPersonsIdList) || this.criteriaDto.OtherPersonsIdList.length == 0) {
            this.otherConnectionsStr = this.dicService.getValue('xAllConnections');
        } else if (this.criteriaDto.OtherPersonsIdList.length == 1) {
            this.otherConnectionsStr = otherPersonName;
        } else {
            this.otherConnectionsStr = this.dicService.getValue('xSelectedConnections') + ': ' + this.criteriaDto.OtherPersonsIdList.length;
        }
    }
    selectPerson(): void {
        if (this.IsInside) return;
        this.isPersonSearchModalOpen = true;

        const criteriaBo = new PersonSearchShowCriteriaBo();
        criteriaBo.Multiple = true;
        criteriaBo.PersonId = this.profile.PersonId;
        criteriaBo.PersonTypeId = this.profile.PersonTypeId;
        criteriaBo.IsOppositeOperation = true;
        criteriaBo.PreCheckedList = this.checkedOtherPersonsList;

        setTimeout(() => {
            let subscriptionCloseSearchModal = this.childPersonSearch.showModal(criteriaBo).subscribe(
                x => {
                    this.utils.unsubs(subscriptionCloseSearchModal);

                    this.checkedOtherPersonsList = x;

                    this.criteriaDto.OtherPersonsIdList = [];
                    let i: number = 0;
                    this.checkedOtherPersonsList.forEach(element => {
                        this.criteriaDto.OtherPersonsIdList.push(element.RelatedPersonId);
                        i++;
                        if (i == x.length) {
                            this.handleOtherConnectionStr(element.RelatedPersonFullName);
                            this.search();
                        }
                    });

                    if (x.length == 0) {
                        this.handleOtherConnectionStr(null);
                        this.search();
                    }

                    //x.handleRelationTypes();

                    /**
                     * if (isDebt) {
                        this.ficheDto.DebtPersonId = x.RelatedPersonId;
                        this.debtRelation = x;
                        this.handleAcceptorPerson();
                    } else {
                        this.creditRelation = x;
                        this.shopChanged();
                    }
 
                    if (isDebt == this.isDebt) {
                        // We must unselect the other person because user has just changed the source person.
                        if (isDebt) {
                            this.ficheDto.CreditPersonId = null;
 
                            this.creditRelation = new PersonRelationListDto(this.dicService);
                        } else {
                            this.ficheDto.DebtPersonId = null;
 
                            this.debtRelation = new PersonRelationListDto(this.dicService);
                        }
 
                        this.handleAcceptorPerson();
                    }
 
                     */


                    //this.xSave = this.ficheDto.AcceptorPersonId == null ? 'xSave' : 'xSend';
                }
            );
        });
    }

    showInside(criteriaDto: FicheGetListCriteriaDto, otherPersonFullName: string): void {
        criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;
        this.criteriaDto = criteriaDto;

        this.insideCriteriaDto = new FicheGetListCriteriaDto();
        this.insideCriteriaDto.copy(criteriaDto);

        this.handleApprovalStatus();

        this.handleFicheTypeFakes();

        this.handleOtherConnectionStr(otherPersonFullName);

        this.dateRange = DateRanges.xToday;
        this.dateRangeChanged();

        this.search();
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
}