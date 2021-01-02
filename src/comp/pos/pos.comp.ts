import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { PersonSearchIndexComp } from '../person/search/index.comp';
import { PosPaymentComp } from './payment/payment.comp';
import { ProductOfferComp } from '../product/offer/offer.comp';

// Service
import { FicheService } from '../../service/fiche/fiche.service';
import { FicheProductService } from '../../service/fiche/product.service';
import { PersonAccountService } from '../../service/person/account.service';
import { LocalStorageService } from '../../service/sys/local-storage.service';
import { DialogService } from '../../service/sys/dialog.service';
import { CompBroadCastService } from '../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../service/dictionary/dictionary.service';
import { AppRouterService } from '../../service/sys/router.service';
import { LogExceptionService } from '../../service/log/exception.service';
import { UtilService } from '../../service/sys/util.service';

// Dto
import { FicheDto } from '../../dto/fiche/fiche.dto';
import { PersonRelationListDto } from '../../dto/person/relation/list.dto';
import { PersonAccountListDto } from '../../dto/person/account/list.dto';
import { PersonAccountGetListCriteriaDto } from '../../dto/person/account/getlist-criteria.dto';
import { PersonRelationSubListDto } from '../../dto/person/relation/sub-list.dto';
import { PersonAccountGetFastRetailCriteriaDto } from '../../dto/person/account/getfastretail-criteria.dto';
import { FicheMoneyDto } from '../../dto/fiche/money/money.dto';

// Bo
import { PersonSearchShowCriteriaBo } from '../../bo/person/search-show-criteria.bo';
import { PersonProfileBo } from '../../bo/person/profile.bo';

// Enum
import { FicheTypes } from '../../enum/fiche/types.enum';
import { FicheContents } from '../../enum/fiche/contents.enum';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { PersonTypes } from '../../enum/person/person-types.enum';
import { DialogIcons } from '../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../enum/sys/dialog/dialog-buttons.enum';
import { AppRoutes } from '../../enum/sys/routes.enum';
import { Stats } from '../../enum/sys/stats.enum';
import { AccountTypes } from '../../enum/person/account-type.enum';
import { RelationTypes } from '../../enum/person/relation-types.enum';
import { ApprovalStats } from '../../enum/approval/stats.enum';
import { Stc, expandCollapse } from '../../stc';

@Component({
    selector: 'pos',
    templateUrl: './pos.comp.html',
    host: { '(window:keydown)': 'hotkeys($event)' },
    animations: [expandCollapse]
})
export class PosComp implements OnInit, OnDestroy {
    ficheDto: FicheDto;
    isDebt: boolean = false;
    isMobile: boolean = Stc.isMobile;

    profile: PersonProfileBo;
    otherPersonRelation: PersonRelationListDto;

    flagSave: boolean = false;
    flagUpdateProducts: boolean = false;

    busy: boolean = false;
    personTypes = PersonTypes;

    cancelCancel: boolean = false;

    isPersonSearchModalOpen: boolean = false;
    isPaymentModalOpen: boolean = false;

    codeStr: string = '';

    seePriceActive: boolean = false;

    subsNeedRefresh: Subscription;
    subsModalClosed: Subscription;

    @ViewChild(PersonSearchIndexComp, { static: false }) childPersonSearch: PersonSearchIndexComp;
    @ViewChild(PosPaymentComp, { static: false }) childPosPayment: PosPaymentComp;
    @ViewChild(ProductOfferComp, { static: false }) childProductOffer: ProductOfferComp;
    constructor(
        private ficheService: FicheService,
        private ficheProductService: FicheProductService,
        private personAccountService: PersonAccountService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private localStorageService: LocalStorageService,
        private appRouter: AppRouterService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.newFiche();
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'PosCalculation') {
                    this.ficheService.calculateTotals(this.ficheDto);
                }
                else if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.newFiche();
                } else if (x == 'FicheCalculated') {
                }
            }
        );

        this.subsModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'PersonSearch') {
                    this.cancelCancel = true;
                    this.isPersonSearchModalOpen = false;
                } else if (message == 'PosPayment') {
                    this.isPaymentModalOpen = false;
                    this.cancelCancel = true;
                } else if (message == 'PersonProduct' || message == 'PosSeePriceComp') {
                    this.cancelCancel = true;
                }
            });
    }
    ngOnDestroy(): void {
        if (this.utils.isNotNull(this.ficheDto) && this.utils.isNotNull(this.ficheDto.ProductList) && this.ficheDto.ProductList.length > 0) {
            this.save(true);
        }

        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subsModalClosed);
    }

    hotkeys(event) {
        switch (event.keyCode) {
            case 115: // F4
                this.updateProducts();
                return false;
            case 119: // F8
                this.seePriceActive = !this.seePriceActive;
                return false;
            case 120: // F9
                this.fastSale(AccountTypes.xCash);
                return false;
            case 121: // F10
                this.fastSale(AccountTypes.xCreditCard);
                return false;
            case 122: // F11
                this.fastSale(AccountTypes.xBank);
                return false;
            case 123: // F12
                this.saveChargeSale();
                return false;
            case 27: // Esc
                if (this.cancelCancel) {
                    this.cancelCancel = false;
                } else {
                    this.cancel();
                }
                return;
        }
    }
    itemValueChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'PosCalculation');
    }

    newFiche(): void {
        this.profile = this.localStorageService.personProfile;

        if (this.profile.PersonTypeId != PersonTypes.xShop) {
            this.toastr.warning('Sadece dükkanlar perakende satış yapabilir.');

            setTimeout(() => {
                this.appRouter.navigate(AppRoutes.homepage);
            });
            return;
        }

        this.ficheDto = new FicheDto(this.utils);
        this.ficheDto.CurrencyId = this.profile.SelectedCurrencyId;

        this.otherPersonRelation = new PersonRelationListDto(this.dicService);

        this.ficheDto.IncludingVat = true;

        // Default customer will be taken from server.
        this.otherPersonRelation = new PersonRelationListDto(this.dicService);
        this.otherPersonRelation.RelatedPersonFullName = this.dicService.getValue('xDefaultRetailCustomer');
        this.otherPersonRelation.RelatedPersonId = Stc.defaultRetailCustomerId;
        this.otherPersonRelation.RelatedPersonTypeId = PersonTypes.xRealPerson;
        this.otherPersonRelation.IsMaster = false;

        this.otherPersonRelation.RelationSubList = [];
        const subList = new PersonRelationSubListDto();
        subList.RelationTypeId = RelationTypes.xCustomer;
        subList.ApprovalStatId = ApprovalStats.xAccepted;
        this.otherPersonRelation.RelationSubList.push(subList);
        this.otherPersonRelation.handleRelationTypes();
        this.ficheDto.DebtPersonId = this.otherPersonRelation.RelatedPersonId;

        this.ficheDto.CreditPersonId = this.profile.PersonId;
        this.ficheDto.IsCreditMaster = true;

        this.ficheDto.FicheTypeId = FicheTypes.xReceipt;
        this.ficheDto.FicheContentId = FicheContents.xStartingBalance;
        this.ficheService.handleFicheContentGroupId(this.ficheDto);

        this.handleAcceptorPerson();

        setTimeout(() => {
            this.childProductOffer.setFocus();
        });
    }

    cancel(): void {
        if (this.utils.isNull(this.ficheDto) || this.utils.isNull(this.ficheDto.ProductList) || this.ficheDto.ProductList.length <= 0) {
            return;
        }
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmCancelPos'),
            icon: DialogIcons.Warning,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.save(true);
            }
        });
    }

    saveCheck(): boolean {
        if (this.profile.PersonTypeId != PersonTypes.xShop) {
            this.toastr.warning('Sadece dükkanlar perakende satış yapabilir.');
            return false;
        }

        if (this.utils.isNull(this.ficheDto.ProductList) || this.ficheDto.ProductList.filter(f => !f.IsDeleted).length == 0) {
            this.toastr.warning(this.dicService.getValue('xNoProduct'));
            return false;
        }

        return true;
    }

    saveSlow(): void {
        if (!this.saveCheck()) return;

        let accountListDto: PersonAccountListDto[];
        accountListDto = [];
        let criteriaDto: PersonAccountGetListCriteriaDto;
        criteriaDto = new PersonAccountGetListCriteriaDto();
        criteriaDto.OwnerPersonId = this.ficheDto.CreditPersonId;
        criteriaDto.StatId = Stats.xActive;
        criteriaDto.CurrencyId = this.ficheDto.CurrencyId;

        let subs = this.personAccountService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    accountListDto = x.Dto;

                    // There must be at least one bank or one cash account.
                    if (this.utils.isNull(x.Dto.find(f => f.AccountTypeId == AccountTypes.xCash))
                        && this.utils.isNull(x.Dto.find(f => f.AccountTypeId == AccountTypes.xBank))) {
                        // No cash and bank account

                        this.dialogService.showError('Satış yapılacak cüzdan bulunamadı. Lütfen cüzdanlar menüsünden nakit veya banka cüzdanı ekleyin.');
                    } else {
                        this.isPaymentModalOpen = true;

                        setTimeout(() => {
                            let subsOpenModal = this.childPosPayment.showModal(this.ficheDto, accountListDto).subscribe(
                                x => {
                                    this.utils.unsubs(subsOpenModal);

                                    this.ficheDto.MoneyList = x;

                                    this.save(false);
                                }
                            );
                        });
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'saveSlow', subs);
                this.busy = false;
            }
        );
    }
    fastSale(accountTypeId: AccountTypes): void {
        if (!this.saveCheck()) return;

        const criteriaDto = new PersonAccountGetFastRetailCriteriaDto();
        criteriaDto.AccountTypeId = accountTypeId;
        criteriaDto.CurrencyId = this.ficheDto.CurrencyId;
        let subs = this.personAccountService.getFastRetail(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    if (this.utils.isNull(x.ReturnedId)) {
                        this.dialogService.showError('Hızlı satış için seçilmiş cüzdan bulunamadı. Lütfen cüzdanlardan bir tanesini hızlı satış olarak seçin veya yeni bir tane ekleyin.');

                        this.saveSlow();
                    } else {
                        const money = new FicheMoneyDto();
                        money.CreditPersonAccountId = null;
                        money.CreditPersonAccountTypeId = accountTypeId;

                        money.DebtPersonAccountId = x.ReturnedId;
                        money.DebtPersonAccountTypeId = accountTypeId == AccountTypes.xCreditCard ? AccountTypes.xBank : accountTypeId;

                        money.Total = this.ficheDto.GrandTotal;

                        this.ficheDto.MoneyList = [];
                        this.ficheDto.MoneyList.push(money);

                        this.save(false);
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'fastSale', subs);
            }
        );
    }

    // only F12
    saveChargeSale(): void {
        if (this.ficheDto.DebtPersonId <= -1) {
            this.dialogService.showError('Varsayılan müşteriye veresiye satış yapılamaz. Lütfen müşteri seçiniz.');
            return;
        } else {
            this.dialogService.show({
                text: this.dicService.getValue('xConfirmNoPaymentPos'),
                icon: DialogIcons.Warning,
                buttons: DialogButtons.YesNo,
                closeIconVisible: true,
                yes: () => {
                    this.save(false);
                }
            });
        }
    }

    // this method was written to be used inside. Do not call this directly.
    // Use 'saveSlow' or 'fastSale' before this method.
    save(isUncompleted: boolean): void {
        if (this.flagSave) return;
        this.flagSave = true;
        this.compBroadCastService.sendMessage(CompBroadCastTypes.GoogleAnalytics);

        // this.ficheDto.IssueDateNumber = this.utils.getNow(); no need this. Service will give the date.
        this.ficheDto.IsUncompleted = isUncompleted;
        this.busy = true;
        let subs = this.ficheService.save(this.ficheDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                this.flagSave = false;

                if (x.IsSuccess) {
                    if (isUncompleted) {
                        this.toastr.warning(this.dicService.getValue('xSaleCancelled'));
                    } else {
                        this.toastr.success(this.dicService.getValue('xSoldSuccessfully'));
                    }

                    this.newFiche();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.flagSave = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;

                this.toastr.error(err); // Do not delete this. I want feedbacks from end-users.
            }
        );
    }

    updateProducts(): void {
        if (this.flagUpdateProducts) return;
        if (this.utils.isNull(this.ficheDto.ProductList) || this.ficheDto.ProductList.filter(f => !f.IsDeleted).length == 0) {
            this.toastr.warning(this.dicService.getValue('xNoProduct'));
            return;
        }
        this.flagUpdateProducts = true;

        this.busy = true;
        let subs = this.ficheProductService.updateProducts(this.ficheDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                this.flagUpdateProducts = false;

                if (x.IsSuccess) {
                    this.toastr.success(this.dicService.getValue('xProductsUpdatedSuccessfully'));

                    this.newFiche();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.flagUpdateProducts = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'updateProducts', subs);
                this.busy = false;
            }
        );
    }

    shopChanged(): void {
        this.ficheDto.CreditPersonId = this.profile.PersonId;

        this.handleAcceptorPerson();
    }

    selectPerson(isDebt: boolean): void {
        this.isPersonSearchModalOpen = true;

        const criteriaBo = new PersonSearchShowCriteriaBo();
        criteriaBo.Multiple = false;

        criteriaBo.PersonId = this.profile.PersonId;
        criteriaBo.PersonTypeId = this.profile.PersonTypeId;
        criteriaBo.IsOppositeOperation = true;

        setTimeout(() => {
            let subsCloseSearchModal = this.childPersonSearch.showModal(criteriaBo).subscribe(
                x => {
                    this.utils.unsubs(subsCloseSearchModal);

                    this.otherPersonRelation = x[0];
                    this.otherPersonRelation.handleRelationTypes();

                    if (this.isDebt) {
                        this.ficheDto.CreditPersonId = this.otherPersonRelation.RelatedPersonId;
                        this.ficheDto.IsCreditMaster = this.otherPersonRelation.IsMaster;

                        this.ficheDto.IsDebtMaster = true;
                    } else {
                        this.ficheDto.DebtPersonId = this.otherPersonRelation.RelatedPersonId;
                        this.ficheDto.IsDebtMaster = this.otherPersonRelation.IsMaster;

                        this.ficheDto.IsCreditMaster = true;
                    }

                    this.handleAcceptorPerson();
                }
            );
        });
    }

    handleAcceptorPerson(): void {
        if (this.otherPersonRelation.IsMaster) {
            this.ficheDto.AcceptorPersonId = null;
        } else {
            this.ficheDto.AcceptorPersonId = this.otherPersonRelation.RelatedPersonId;
        }
    }

    canDeactivate(): boolean {
        let canActivate: boolean = false;
        canActivate = this.utils.isNotNull(this.ficheDto) && this.utils.isNotNull(this.ficheDto.ProductList) && this.ficheDto.ProductList.length > 0;

        return !canActivate;
    }
}