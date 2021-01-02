import { Component, OnInit, ViewChild, OnDestroy, Host } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { PosComp } from '../pos.comp';
import { PosSeePriceComp } from '../see-price/see-price.comp';

// Service
import { FicheService } from '../../../service/fiche/fiche.service';
import { PersonProductService } from '../../../service/person/product.service';
import { ProductService } from '../../../service/product/product.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { FicheProductDto } from '../../../dto/fiche/product/product.dto';
import { PersonProductGetCriteriaDto } from '../../../dto/person/product/get-criteria.dto';
import { ProductSaveDto } from '../../../dto/product/save.dto';
import { PersonProductUpdateDto } from '../../../dto/person/product/update.dto';

// Bo
import { ProductOfferBo } from '../../../bo/product/offer.bo';
import { ModalProductNewBo } from '../../../bo/modal/product-new.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { ProductTypes } from '../../../enum/product/types.enum';
import { ProductUpdateTypes } from '../../../enum/product/update-types.enum';
import { Stc, expandCollapse } from '../../../stc';

@Component({
    selector: 'pos-product-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PosProductListIndexComp implements OnInit, OnDestroy {
    @ViewChild(PosSeePriceComp, { static: false }) childPosSeePriceComp: PosSeePriceComp;

    subsModalClosed: Subscription;
    subsItemSelected: Subscription;
    subsOpen: Subscription;
    subsSaved: Subscription;

    isSeePriceModalOpen: boolean = false;

    busy: boolean = false;
    isOpenKeyPad: boolean = false;
    isMobile: boolean = Stc.isMobile;

    host: PosComp;

    constructor(
        @Host() host: PosComp,
        private ficheService: FicheService,
        private personProductService: PersonProductService,
        private productService: ProductService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.host = host;
    }

    ngOnInit(): void {
        this.subsItemSelected = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('ProductOffer')) {
                        const offerBo: ProductOfferBo = JSON.parse(x).ProductOffer;

                        if (this.host.seePriceActive) {
                            this.showSeePrice(offerBo, this.host.ficheDto.CreditPersonId);
                        } else {
                            this.getProduct(offerBo);
                        }
                    }
                }
            });
        this.subsOpen = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Open).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonProductInPos')) {
                        const offerBo: ProductOfferBo = JSON.parse(x).PersonProductInPos;

                        this.showModalNew(offerBo);
                    }
                }
            });
        this.subsModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'PosSeePriceComp') {
                    this.isSeePriceModalOpen = false;
                    this.host.childProductOffer.setFocus();
                }
            });
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('ProductNewComp')) {
                        const productSaveDto: ProductSaveDto = JSON.parse(x).ProductNewComp;

                        const offerBo = new ProductOfferBo();
                        offerBo.ProductId = productSaveDto.Id;
                        offerBo.Quantity = 1;
                        this.getProduct(offerBo);
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsModalClosed);
        this.utils.unsubs(this.subsItemSelected);
        this.utils.unsubs(this.subsOpen);
        this.utils.unsubs(this.subsSaved);
    }

    shortcutAddClicked(listItem: FicheProductDto): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemAdded, JSON.stringify({ 'PosProductShortcut': { 'productId': listItem.ProductId, 'productName': listItem.ProductName } }));
    }

    showModalNew(offerBo: ProductOfferBo): void {
        this.dialogService.show({
            text: this.dicService.getValue('xNoProductCodeFound') + '<br>' + this.dicService.getValue('xDoYouWantAddOne'),
            icon: DialogIcons.Info,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const productNewBo = new ModalProductNewBo();
                productNewBo.ProductTypeId = ProductTypes.xShopping;
                productNewBo.PersonId = this.host.profile.PersonId;
                productNewBo.Name = null;
                productNewBo.Barcode = offerBo.Code;
                productNewBo.IsFoodBeverage = false;
                this.productService.showModalNew(productNewBo);
            }
        });
    }

    getProduct(offerBo: ProductOfferBo): void {
        const criteriaDto = new PersonProductGetCriteriaDto();
        criteriaDto.ProductId = offerBo.ProductId;
        criteriaDto.ProductCode = offerBo.Code;
        criteriaDto.PersonId = this.host.ficheDto.CreditPersonId;
        criteriaDto.CurrencyId = this.host.ficheDto.CurrencyId;

        //if(this.host.ficheDto.AcceptorPersonId==null
        //||(this.host.isDebt))

        this.compBroadCastService.sendMessage(CompBroadCastTypes.Busy, JSON.stringify({ 'data': { 'name': 'ProductOfferComp', 'value': true } }));

        //this.busy = true;
        let subscribeGetList = this.personProductService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subscribeGetList);
                this.busy = false;
                this.compBroadCastService.sendMessage(CompBroadCastTypes.Busy, JSON.stringify({ 'data': { 'name': 'ProductOfferComp', 'value': false } }));

                if (x.IsSuccess && this.utils.isNull(x.Dto)) {
                    this.host.codeStr = '';

                    this.showModalNew(offerBo);
                } else if (x.IsSuccess && this.utils.isNotNull(x.Dto)) {
                    this.ficheService.addProduct(x.Dto, this.host.ficheDto.CreditPersonId, this.host.ficheDto, false, offerBo.Quantity);

                    this.host.codeStr = '';

                    //  this.host.save(true);
                } else if (!x.IsSuccess) {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.host.codeStr = '';

                this.utils.unsubs(subscribeGetList);
                this.busy = false;

                this.compBroadCastService.sendMessage(CompBroadCastTypes.Busy, JSON.stringify({ 'data': { 'name': 'ProductOfferComp', 'value': false } }));

                console.log('product getList:' + err);
            }
        );
    }

    itemValueChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'PosCalculation');
    }

    delete(id: number): void {
        const t_product = this.host.ficheDto.ProductList.find(x => x.Id == id);
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmRemove'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                //this.removeItem(id);
                t_product.IsDeleted = true;

                this.itemValueChanged();
            }
        });
    }

    removeItem(id: number) {
        const ind: number = this.host.ficheDto.ProductList.findIndex(x => x.Id == id);
        this.host.ficheDto.ProductList.splice(ind, 1);

        this.itemValueChanged();
    }

    getClearList(): FicheProductDto[] {
        return this.host.ficheDto.ProductList.filter(x => !x.IsDeleted);
    }

    showSeePrice(offerBo: ProductOfferBo, shopId: number): void {
        this.isSeePriceModalOpen = true;

        setTimeout(() => {
            this.childPosSeePriceComp.showModal(offerBo, shopId);
            this.host.seePriceActive = false;
        });
    }

    editProductName(listItem: FicheProductDto): void {
        listItem.IsNameInEdit = true;
        listItem.NameBeforeEdit = listItem.ProductName;
    }
    cancelEditProductName(listItem: FicheProductDto): void {
        listItem.IsNameInEdit = false;
        listItem.ProductName = listItem.NameBeforeEdit;
    }
    saveProductName(listItem: FicheProductDto): void {
        this.busy = true;

        const updateDto = new PersonProductUpdateDto();
        updateDto.PersonProductId = listItem.PersonProductId;
        updateDto.Name = listItem.ProductName;

        updateDto.ProductUpdateTypeList = [];
        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xName);

        let subs = this.personProductService.update(updateDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                listItem.IsNameInEdit = false;

                if (x.IsSuccess) {
                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                listItem.IsNameInEdit = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'saveProductName', subs);
                this.busy = false;
            }
        );
    }

    checkQuantity(listItem: FicheProductDto, newValue: number): void {
        listItem.Quantity = this.ficheService.checkQuantity(newValue);

        this.itemValueChanged();
    }
}