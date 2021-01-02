import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { FicheListIndexComp } from '../index.comp';
import { FicheApprovalHistoryListComp } from '../../approval-history/approval-history.comp';

// Service
import { FicheService } from '../../../../service/fiche/fiche.service';
import { FicheMoneyService } from '../../../../service/fiche/money.service';
import { FicheProductService } from '../../../../service/fiche/product.service';
import { PersonRelationService } from '../../../../service/person/relation.service';
import { ToastrService } from 'ngx-toastr';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { FicheListDto } from '../../../../dto/fiche/list.dto';
import { FicheProductListDto } from '../../../../dto/fiche/product/list.dto';
import { FicheMoneyListDto } from '../../../../dto/fiche/money/list.dto';
import { FicheMoneyGetCriteriaDto } from '../../../../dto/fiche/money/getlist-criteria.dto.ts';
import { FicheProductGetListCriteriaDto } from '../../../../dto/fiche/product/getlist-criteria.dto';
import { FicheGetListCriteriaDto } from '../../../../dto/fiche/getlist-criteria.dto';
import { FicheDeleteDto } from '../../../../dto/fiche/delete.dto';
import { FicheGetActionsCriteriaDto } from '../../../../dto/fiche/getactions-criteria.dto';
import { FicheActionsDto } from '../../../../dto/fiche/actions.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { FicheTypes } from '../../../../enum/fiche/types.enum';
import { Currencies } from '../../../../enum/person/currencies.enum';
import { ApprovalStats } from '../../../../enum/approval/stats.enum';
import { FicheTypeFakes } from '../../../../enum/fiche/type-fakes.enum';
import { PaymentStats } from '../../../../enum/fiche/payment-stats.enum';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';
import { RelationTypes } from '../../../../enum/person/relation-types.enum';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'fiche-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class FicheListItemComp implements OnInit, OnDestroy {
    @Input('listItem') listItem: FicheListDto;
    @Input('forRelated') forRelated: FicheListDto;

    profile: PersonProfileBo;

    @ViewChild(FicheListIndexComp, { static: false }) childRelatedFiches: FicheListIndexComp;
    @ViewChild(FicheApprovalHistoryListComp, { static: false }) childFicheApprovalHistoryList: FicheApprovalHistoryListComp;

    ficheProductList: FicheProductListDto[];
    ficheMoneyList: FicheMoneyListDto[];

    ficheActionsDto: FicheActionsDto;

    busy: boolean = false;

    showProductList: boolean = false;
    gotProductList: boolean = false; // in order to prevent to get same data from server.

    showMoneyList: boolean = false;
    gotMoneyList: boolean = false;

    showRelatedFicheList: boolean = false;
    gotRelatedFicheList: boolean = false;
    showNotes: boolean = false;

    showHistoryList: boolean = false;

    isAuthorSeller: boolean = false;

    ficheTypes = FicheTypes;
    ficheTypeFakes = FicheTypeFakes;
    currencies = Currencies;
    approvalStats = ApprovalStats;
    paymentStats = PaymentStats;

    constructor(
        private ficheService: FicheService,
        private ficheProductService: FicheProductService,
        private ficheMoneyService: FicheMoneyService,
        private toastr: ToastrService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private personRelationService: PersonRelationService,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
        this.ficheProductList = [];
        this.ficheMoneyList = [];

        this.ficheActionsDto = new FicheActionsDto();
    }

    ngOnInit(): void {
        this.getActions();
    }
    ngOnDestroy(): void {
    }

    delete(listItem: FicheListDto): void {
        if (!this.personRelationService.hasRelationIn(RelationTypes.xMyself, RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
            return;
        }

        let strText: string = '';

        if (listItem.FicheTypeId == FicheTypes.xInvoice || listItem.FicheTypeId == FicheTypes.xReceipt) {
            strText = 'Varsa fiş/faturaya ait ödemeler de silinecek.\n';
        } else {
        }

        strText += this.dicService.getValue('xConfirmDelete');

        this.dialogService.show({
            text: strText,
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const deleteDto = new FicheDeleteDto();
                deleteDto.FicheId = listItem.Id;

                this.busy = true;
                let subs = this.ficheService.delete(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.loadData(this.listItem.Id);

                            if (x.Message == '[DeleteRequestSent]')
                                this.toastr.success(this.dicService.getValue('xFicheDeleteRequestSent'));
                            else
                                this.toastr.success(this.dicService.getValue('xFicheDeleted'));
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'delete', subs);
                this.busy = false;
                    }
                );
            }
        });
    }

    loadData(ficheId: number): void {
        const criteriaDto = new FicheGetListCriteriaDto();
        criteriaDto.FicheId = ficheId;

        this.busy = true;
        let subs = this.ficheService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.listItem = x.Dto[0];

                    this.getActions();
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

    // Do not merge method 'loadData' and 'showModal'.
    showModal(ficheId: number): void {
        this.loadData(ficheId);
    }

    save(approvalStatId: ApprovalStats): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.SaveAttempt, JSON.stringify({ 'ApprovalFicheSaveAttempt': { 'ficheId': this.listItem.Id, 'approvalStatId': approvalStatId, 'ficheApprovalStatId': this.listItem.ApprovalStatId } }));
    }

    getProductListClick(): void {
        this.showProductList = !this.showProductList;
        if (!this.showProductList || this.gotProductList) return;

        this.busy = true;
        const criteriaDto = new FicheProductGetListCriteriaDto();
        criteriaDto.FicheId = this.listItem.Id;
        let subscribeGetList = this.ficheProductService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subscribeGetList);
                this.busy = false;

                if (x.IsSuccess) {
                    this.ficheProductList = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }

                this.gotProductList = true;
            },
            err => {
                this.utils.unsubs(subscribeGetList);
                this.busy = false;
            }
        );
    }

    getMoneyListClick(): void {
        this.showMoneyList = !this.showMoneyList;
        if (!this.showMoneyList || this.gotMoneyList) return;

        this.busy = true;
        const criteriaDto = new FicheMoneyGetCriteriaDto();
        criteriaDto.FicheId = this.listItem.Id;
        let subscribeGetList = this.ficheMoneyService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subscribeGetList);
                this.busy = false;

                if (x.IsSuccess) {
                    this.ficheMoneyList = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }

                this.gotMoneyList = true;
            },
            err => {
                this.utils.unsubs(subscribeGetList);
                this.busy = false;
            }
        );
    }

    getRelatedFicheList(): void {
        this.showRelatedFicheList = !this.showRelatedFicheList;
        if (!this.showRelatedFicheList || this.gotRelatedFicheList) return;

        setTimeout(() => {
            const criteriaDto = new FicheGetListCriteriaDto();
            criteriaDto.FicheIdRelated = this.listItem.Id;
            //criteriaDto.MyPersonId = this.listItem.IsDebtor ? this.listItem.DebtPersonId : this.listItem.CreditPersonId;

            this.childRelatedFiches.showInside(criteriaDto, this.listItem.IsDebtor ? this.listItem.DebtPersonFullName : this.listItem.CreditPersonFullName);
        });
    }

    getFicheApprovalHistoryList(): void {
        this.showHistoryList = !this.showHistoryList;

        if (!this.showHistoryList) return;

        setTimeout(() => {
            this.childFicheApprovalHistoryList.show(this.listItem.Id);
        });
    }

    getActions(): void {
        if (this.utils.isNull(this.listItem)) return;

        const criteriaDto = new FicheGetActionsCriteriaDto();
        criteriaDto.FicheId = this.listItem.Id;
        let subs = this.ficheService.getActions(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.ficheActionsDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getActions', subs);
            }
        );
    }
}