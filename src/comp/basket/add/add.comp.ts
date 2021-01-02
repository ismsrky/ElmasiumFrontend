import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CurrencyMaskConfig } from 'ngx-currency';

// Comp
import { OptionSelectComp } from '../../option/select/select.comp';
import { IncludeExcludeSelectComp } from '../../include-exclude/select/select.comp';

// Service
import { BasketProductService } from '../../../service/basket/product.service';
import { PersonProductService } from '../../../service/person/product.service';
import { OrderService } from '../../../service/order/order.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '.././../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { BasketProductSaveDto } from '../../../dto/basket/product/save.dto';
import { PersonProductProfileGetCriteriaDto } from '../../../dto/person/product/profile-get-criteria.dto';
import { PersonProductProfileDto } from '../../../dto/person/product/profile.dto';

// Bo
import { ModalBasketAddBo } from '../../../bo/modal/basket-add.bo';
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { environment } from '../../../environments/environment';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'basket-add',
    templateUrl: './add.comp.html',
    styleUrls: ['./add.comp.css'],
    animations: [expandCollapse],
})
export class BasketAddComp implements OnInit, OnDestroy {
    saveDto: BasketProductSaveDto;
    basketAddBo: ModalBasketAddBo;

    personProductProfileDto: PersonProductProfileDto = null;

    grandTotal: number = 0;

    @ViewChild('saveForm', { static: false }) saveForm: NgForm;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;
    @ViewChild(OptionSelectComp, { static: false }) childOptionSelectComp: OptionSelectComp;
    @ViewChild('excludingSelect', { static: false }) childExcludeSelectComp: IncludeExcludeSelectComp;
    @ViewChild('includeSelect', { static: false }) childIncludeSelectComp: IncludeExcludeSelectComp;

    xActionName: string = 'xAddToBasket';
    actionIconName: string = 'cart-plus';
    actionColorName: string = 'primary';

    profile: PersonProfileBo;

    isNarrow: boolean = true;

    subscriptionReady: Subscription;
    subsNeedRefresh: Subscription;

    configQuantity: CurrencyMaskConfig;

    environment = environment;

    busy: boolean = false;

    isReadyPersonProductProfile: boolean = false;
    isReadyOptionList: boolean = false;
    isReadyIncludeList: boolean = false;
    isReadyExcludeList: boolean = false;

    isActionBtnHover: boolean = false;
    constructor(
        private basketProductService: BasketProductService,
        private personProductService: PersonProductService,
        private orderService: OrderService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {
        this.isNarrow = window.innerWidth <= 768; // md

        this.configQuantity = this.utils.getQuantityMaskOptions();

        this.profile = this.localStorageService.personProfile;

        this.personProductProfileDto = new PersonProductProfileDto();

        this.saveDto = new BasketProductSaveDto();
    }

    ngOnInit(): void {
        this.subscriptionReady = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Ready).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('OptionSelectComp')) {
                        const personProductId: number = JSON.parse(x).OptionSelectComp.personProductId;

                        if (personProductId == this.basketAddBo.PersonProductId) {
                            this.isReadyOptionList = true;
                        }
                    } else if (x.includes('IncludeExcludeSelectComp')) {
                        const personProductId: number = JSON.parse(x).IncludeExcludeSelectComp.personProductId;
                        const isInclude: number = JSON.parse(x).IncludeExcludeSelectComp.isInclude;

                        if (personProductId == this.basketAddBo.PersonProductId) {
                            if (isInclude) {
                                this.isReadyIncludeList = true;
                            } else {
                                this.isReadyExcludeList = true;
                            }
                        }
                    }
                }
            }
        );
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('OptionSelectCompCalculate')) {
                        const personProductId: number = JSON.parse(x).OptionSelectCompCalculate.personProductId;

                        if (personProductId == this.basketAddBo.PersonProductId) {
                            this.calculate();
                        }
                    } else if (x.includes('IncludeExcludeSelectCompCalculate')) {
                        const personProductId: number = JSON.parse(x).IncludeExcludeSelectCompCalculate.personProductId;

                        if (personProductId == this.basketAddBo.PersonProductId) {
                            this.calculate();
                        }
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionReady);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    showModal(basketAddBo: ModalBasketAddBo): void {
        this.xActionName = this.dicService.getValue(basketAddBo.IsFastSale ? 'xBuyNow' : 'xAddToBasket');
        this.actionIconName = basketAddBo.IsFastSale ? 'hand-o-right' : 'cart-plus';
        this.actionColorName = basketAddBo.IsFastSale ? 'success' : 'primary';

        this.basketAddBo = basketAddBo;

        this.saveDto = new BasketProductSaveDto();
        this.saveDto.DebtPersonId = this.profile.PersonId;
        this.saveDto.CreditPersonId = basketAddBo.ShopId;

        this.saveDto.ProductId = basketAddBo.ProductId;

        this.saveDto.CurrencyId = this.profile.SelectedCurrencyId;
        this.saveDto.IsFastSale = basketAddBo.IsFastSale;

        this.saveDto.Quantity = basketAddBo.Quantity;

        this.getPersonProductProfile();

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'BasketAddComp');
            }
        );

        this.modal.show();
    }

    save(): void {
        if (this.saveForm.invalid || !this.childOptionSelectComp.isValid()
            || !this.isReadyOptionList || !this.isReadyPersonProductProfile
            || !this.isReadyIncludeList || !this.isReadyExcludeList) return;

        this.saveDto.OptionIdList = this.childOptionSelectComp.selectedOptionIdList;
        this.saveDto.IncludeExcludeIdList = this.childIncludeSelectComp.selectedIdList.concat(this.childExcludeSelectComp.selectedIdList);
        this.busy = true;
        let subs = this.basketProductService.save(this.saveDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.basketAddBo.IsFastSale) {
                        this.orderService.goToCreateOrder(x.ReturnedId);
                    } else {
                        this.toastr.success(this.dicService.getValue('xAddedToBasket'));
                    }

                    this.modal.hide();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;
            }
        );
    }
    cancel(): void {
        this.modal.hide();
    }

    getPersonProductProfile(): void {
        this.busy = true;
        const criteriaDto = new PersonProductProfileGetCriteriaDto();
        criteriaDto.CaseId = 1; // 1: PersonProductId must be given.
        criteriaDto.PersonProductId = this.basketAddBo.PersonProductId;
        let subs = this.personProductService.getProfile(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.personProductProfileDto = x.Dto;

                    this.childOptionSelectComp.show(this.basketAddBo.PersonProductId, this.personProductProfileDto.ShopDefaultCurrencyId, null);
                    this.childIncludeSelectComp.show(this.basketAddBo.PersonProductId, this.personProductProfileDto.ShopDefaultCurrencyId, null);
                    this.childExcludeSelectComp.show(this.basketAddBo.PersonProductId, this.personProductProfileDto.ShopDefaultCurrencyId, null);

                    this.isReadyPersonProductProfile = true;

                    this.calculate();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getPersonProductProfile', subs);
                this.busy = false;
            }
        );
    }

    calculate(): void {
        this.grandTotal = this.saveDto.Quantity
            * (this.personProductProfileDto.OnlineSalePrice
                + this.childOptionSelectComp.grandPriceGap
                + this.childIncludeSelectComp.grandPriceGap
                + this.childExcludeSelectComp.grandPriceGap);
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}