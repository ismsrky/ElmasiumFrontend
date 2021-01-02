import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

// Service
import { ProductService } from '../../../service/product/product.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { ProductSaveDto } from '../../../dto/product/save.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';
import { ModalProductNewBo } from '../../../bo/modal/product-new.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { ProductTypes } from '../../../enum/product/types.enum';
import { ProductCodeTypes } from '../../../enum/product/code-types.enum';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'product-new',
    templateUrl: './new.comp.html',
    animations: [expandCollapse]
})
export class ProductNewComp implements OnInit, OnDestroy {
    productTypes = ProductTypes;
    productCodeTypes = ProductCodeTypes;

    productDto: ProductSaveDto;

    productNewBo: ModalProductNewBo;

    profile: PersonProfileBo;

    isFoodBeverage: boolean = false;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;
    @ViewChild('productForm', { static: false }) productForm: NgForm;

    configCurrency: CurrencyMaskConfig;
    configPercentage: CurrencyMaskConfig;

    hasBarcode: boolean = false;

    xCaption: string = 'xNew';

    busy: boolean = false;
    constructor(
        private productService: ProductService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private localStorageService: LocalStorageService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
        this.productDto = new ProductSaveDto();
        this.productNewBo = new ModalProductNewBo();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(productNewBo: ModalProductNewBo): void {
        this.productNewBo = productNewBo;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.profile.SelectedCurrencyId);
        this.configPercentage = this.utils.getPercentageMaskOptions();
        this.configPercentage.prefix = this.dicService.getValue('xVat') + ': % ';

        this.productDto = new ProductSaveDto();
        this.productDto.ProductTypeId = productNewBo.ProductTypeId;
        this.productDto.PersonId = productNewBo.PersonId;
        this.productDto.Name = productNewBo.Name;
        this.productDto.Barcode = productNewBo.Barcode;

        if (productNewBo.IsFoodBeverage) {
            this.productDto.ProductTypeId = ProductTypes.xFoodBeverage;
            this.productDto.VatRate = 8;
            this.xCaption = 'xNewFoodBeverage';
        } else {
            this.productDto.VatRate = 18;
            this.xCaption = 'xNew';
        }

        if (productNewBo.ProductTypeId == ProductTypes.xShopping && this.utils.isNotNull(productNewBo.Barcode)) {
            this.hasBarcode = true;
        }

        this.getNextId();

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'ProductNewComp');
            }
        );

        this.modal.show();
    }

    save(): void {
        if (this.productForm.invalid) {
            return;
        }
        /**
         * if (this.productForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
         */

        this.busy = true;
        let subs = this.productService.save(this.productDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({ 'ProductNewComp': this.productDto }));

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                    this.close();
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

    getNextId(): void {
        let subs = this.productService.getNextId().subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.productDto.Id = x.ReturnedId;
                    this.productTypeChange();
                } else {
                    this.dialogService.showError(x.Message);

                    this.close();
                }
            },
            err => {
                this.close();

                this.logExService.saveObservableEx(err, this.constructor.name, 'getNextId', subs);
            }
        );
    }

    productTypeChange(): void {
        if (this.productDto.ProductTypeId != ProductTypes.xShopping) {
            this.productDto.Barcode = null;
        }

        this.productDto.ProductCode = this.productService.getStockCode(this.productDto.Id, this.productDto.ProductTypeId);
    }
    hasBarcodeChange(): void {
        if (!this.hasBarcode) {
            this.productDto.Barcode = null;
        }
    }

    close(): void {
        this.modal.hide();
    }
}