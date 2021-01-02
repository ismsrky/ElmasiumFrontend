import { Component, OnInit, ViewChild, OnDestroy, Input, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

// Comp
import { ProductOfferCriteriaComp } from './criteria/criteria.comp';

// Service
import { ProductService } from '../../../service/product/product.service';
import { ProductFilterService } from '../../../service/product/filter.service';
import { PersonProductService } from '../../../service/person/product.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { ProductFilterPoolGetListCriteriaDto } from '../../../dto/product/filter/pool-getlist-criteria.dto';
import { ProductFilterPoolListDto } from '../../../dto/product/filter/pool-list.dto';
import { PersonProductAddInventoryDto } from '../../../dto/person/product/add-inventory.dto';

// Bo
import { ProductOfferBo } from '../../../bo/product/offer.bo';
import { ModalProductNewBo } from '../../../bo/modal/product-new.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { ProductCodeTypes } from '../../../enum/product/code-types.enum';
import { ProductTypes } from '../../../enum/product/types.enum';
import { environment } from '../../../environments/environment';
import { Stc, expandCollapse } from '../../../stc';

@Component({
    selector: 'product-offer',
    templateUrl: './offer.comp.html',
    animations: [expandCollapse],
    host: { '(document:click)': 'onClick($event)' }
})
export class ProductOfferComp implements OnInit, OnDestroy {
    productListDto: ProductFilterPoolListDto[];

    @Input('personId') personId: number;
    @Input('isFoodBeverage') isFoodBeverage: boolean = false;

    @Input('onTop') onTop: boolean = false;
    @Input('onTopOpen1') onTopOpen1: boolean = false;
    @Input('onTopOpen2') onTopOpen2: boolean = false;

    criteriaDto: ProductFilterPoolGetListCriteriaDto;

    @ViewChild(ProductOfferCriteriaComp, { static: false }) childProductOfferCriteriaComp: ProductOfferCriteriaComp;

    busy: boolean = false;

    codeFocused: boolean = false;

    environment = environment;

    showList: boolean = false;

    isCriteriaOpen: boolean = false;

    subscriptionCodeModelChange: Subscription;
    codeControl = new FormControl();

    subscriptionBusy: Subscription;
    subsItemSelected: Subscription;
    subscriptionModalClosed: Subscription;

    waitTill: boolean = false;

    isMobile: boolean = Stc.isMobile;

    productCodeTypes = ProductCodeTypes;
    productTypes = ProductTypes;
    constructor(
        private productService: ProductService,
        private personProductService: PersonProductService,
        private productFilterService: ProductFilterService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.criteriaDto = new ProductFilterPoolGetListCriteriaDto();
        this.productListDto = [];
    }

    ngOnInit(): void {
        this.subscriptionCodeModelChange = this.codeControl.valueChanges.pipe(
            debounceTime(Stc.typingEndTime)
        ).subscribe(newValue => {
            this.productListDto = [];
            this.criteriaDto.ProductNameCode = newValue;

            if (this.utils.isNotNull(this.criteriaDto.ProductNameCode)) {
                this.search();
            } else {
                this.criteriaDto.ProductNameCode = null;
                this.codeControl.setValue(null);
            }
        });

        this.subsItemSelected = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PosProductShortcut')) {
                        const productId: number = JSON.parse(x).PosProductShortcut;

                        const offerBo = this.productService.getCode(this.txtCode.nativeElement.value);
                        offerBo.ProductId = productId;
                        offerBo.Code = null;
                        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, JSON.stringify({ 'ProductOffer': offerBo }));

                        this.txtCode.nativeElement.value = null;
                    }
                }
            });
        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'ProductOfferCriteriaComp') {
                    this.isCriteriaOpen = false;
                }
            });

        this.subscriptionBusy = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Busy).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    const data = JSON.parse(x).data;

                    if (data.name == 'ProductOfferComp') {
                        this.busy = data.value;
                    }
                }
            }
        );

        if (Stc.isMobile == false) {
            this.setFocus();
        }
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionCodeModelChange);
        this.utils.unsubs(this.subsItemSelected);
        this.utils.unsubs(this.subscriptionModalClosed);
        this.utils.unsubs(this.subscriptionBusy);
    }

    onClick(event): void {
        // We must keep txtCode focused every time.
        // Nothing can cause lost focus of it.

        if (Stc.isHelpOpen) return;

        if (!this.onTop) return;

        if (Stc.isMobile || this.onTopOpen1 || this.onTopOpen2) {

        } else {
            let typeStr: string = event.target.type;

            if (typeStr == 'text' || typeStr == 'number' || typeStr == 'select-one' || typeStr == 'tel') {
                //this.ficheService.calculateTotals(this.ficheDto);
            } else {
                this.setFocus();
            }
        }
    }

    @ViewChild('txtCode', { static: false }) txtCode: ElementRef;
    keyDownFunction(event): void {
        if (event.keyCode != 13 || this.utils.isNull(this.txtCode.nativeElement.value)) return;

        this.showList = false;
        this.criteriaDto.ProductNameCode = null;
        let code: string = this.txtCode.nativeElement.value;
        this.codeControl.setValue(null);

        const offerBo = this.productService.getCode(code);

        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, JSON.stringify({ 'ProductOffer': offerBo }));

        this.productListDto = [];
    }

    search(): void {
        if (this.waitTill || this.utils.isNull(this.criteriaDto.ProductNameCode)) return;

        this.waitTill = true;

        if (this.utils.isNull(this.criteriaDto.ProductNameCode)) {
            this.waitTill = false;
            this.productListDto = [];
            return;
        }

        if (this.isFoodBeverage) {
            this.criteriaDto.ProductTypeId = ProductTypes.xFoodBeverage;
        }

        this.busy = true;
        this.criteriaDto.PageOffSet = this.productListDto.length;
        this.criteriaDto.PersonId = this.personId;
        let subs = this.productFilterService.getPoolList(this.criteriaDto).subscribe(
            x => {
                this.waitTill = false;
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    //this.productListDto = x.Dto;

                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let found: ProductFilterPoolListDto = null;
                        x.Dto.forEach(element => {
                            found = this.productListDto.find(f => f.ProductId == element.ProductId);
                            if (this.utils.isNull(found)) {
                                this.productListDto.push(element);
                            }
                        });
                    }

                    this.showList = true;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.waitTill = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'search', subs);
                this.busy = false;
            }
        );
    }

    clear(): void {
        this.criteriaDto = new ProductFilterPoolGetListCriteriaDto();

        this.search();
    }

    getProduct(productDto: ProductFilterPoolListDto): void {
        this.showList = false;

        const offerBo = new ProductOfferBo();
        offerBo.ProductId = productDto.ProductId;
        offerBo.Code = null;
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, JSON.stringify({ 'ProductOffer': offerBo }));

        this.criteriaDto.ProductNameCode = null;
        this.codeControl.setValue(null);
        this.productListDto = [];
    }

    setFocus(): void {
        setTimeout(() => {
            this.txtCode.nativeElement.focus();
        });
    }

    addToInventory(productListDto: ProductFilterPoolListDto): void {
        const addDto = new PersonProductAddInventoryDto();
        addDto.ProductId = productListDto.ProductId;
        addDto.PersonId = this.personId;
        this.busy = true;
        let subs = this.personProductService.addToInventory(addDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    productListDto.PersonProductId = x.ReturnedId;
                    productListDto.Balance = 0;

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({ 'ProductAddedToInventory': { 'personProductId': productListDto.PersonProductId } }));

                    this.toastr.success(this.dicService.getValue('xAddedToInventory'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'addToInventory', subs);
                this.busy = false;
            }
        );
    }

    addNewProduct(): void {
        const productNewBo = new ModalProductNewBo();
        productNewBo.ProductTypeId = ProductTypes.xShopping;
        productNewBo.PersonId = this.personId;
        productNewBo.Name = this.criteriaDto.ProductNameCode;
        productNewBo.Barcode = null;
        productNewBo.IsFoodBeverage = this.isFoodBeverage;
        this.productService.showModalNew(productNewBo);
        this.criteriaDto.ProductNameCode = null;
        this.productListDto = [];
    }

    showCriteria(): void {
        this.isCriteriaOpen = true;

        setTimeout(() => {
            let subs = this.childProductOfferCriteriaComp.showModal(this.criteriaDto).subscribe(
                x => {
                    this.utils.unsubs(subs);

                    this.criteriaDto = x;

                    this.productListDto = [];
                    this.search();
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'showCriteria', subs);
                }
            );
        });
    }
}