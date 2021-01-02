import { Component, OnInit, OnDestroy, Host } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { FicheCrudComp } from '../../crud.comp';

// Service
import { FicheService } from '../../../../../service/fiche/fiche.service';
import { PersonProductService } from '../../../../../service/person/product.service';
import { ProductService } from '../../../../../service/product/product.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonProductGetCriteriaDto } from '../../../../../dto/person/product/get-criteria.dto';
import { ProductSaveDto } from '../../../../../dto/product/save.dto';
import { FicheProductDto } from '../../../../../dto/fiche/product/product.dto';

// Bo
import { ProductOfferBo } from '../../../../../bo/product/offer.bo';
import { ModalProductNewBo } from '../../../../../bo/modal/product-new.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../enum/sys/dialog/dialog-buttons.enum';
import { ProductTypes } from '../../../../../enum/product/types.enum';
import { expandCollapse } from '../../../../../stc';

@Component({
    selector: 'fiche-product-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class FicheProductListIndexComp implements OnInit, OnDestroy {
    subsItemSelected: Subscription;
    subsSaved: Subscription;

    host: FicheCrudComp;

    constructor(
        @Host() host: FicheCrudComp,
        private productService: ProductService,
        private personProductService: PersonProductService,
        private ficheService: FicheService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
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

                        this.getProduct(offerBo);
                    }
                }
            }
        );
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
        this.utils.unsubs(this.subsItemSelected);
        this.utils.unsubs(this.subsSaved);
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
                this.productService.showModalNew(productNewBo);
            }
        });
    }

    getProduct(offerBo: ProductOfferBo): void {
        const criteriaDto = new PersonProductGetCriteriaDto();
        criteriaDto.ProductId = offerBo.ProductId;
        criteriaDto.ProductCode = offerBo.Code;
        criteriaDto.PersonId = this.host.profile.PersonId;
        criteriaDto.CurrencyId = this.host.ficheDto.CurrencyId;

        //if(this.host.ficheDto.AcceptorPersonId==null
        //||(this.host.isDebt))

        this.compBroadCastService.sendMessage(CompBroadCastTypes.Busy, JSON.stringify({ 'data': { 'name': 'ProductOfferComp', 'value': true } }));
        let subs = this.personProductService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.compBroadCastService.sendMessage(CompBroadCastTypes.Busy, JSON.stringify({ 'data': { 'name': 'ProductOfferComp', 'value': false } }));

                if (x.IsSuccess && this.utils.isNull(x.Dto)) {
                    this.showModalNew(offerBo);
                } else if (x.IsSuccess && this.utils.isNotNull(x.Dto)) {
                    this.ficheService.addProduct(x.Dto, this.host.profile.PersonId, this.host.ficheDto, this.host.isDebt, offerBo.Quantity);
                }
            },
            err => {
                this.compBroadCastService.sendMessage(CompBroadCastTypes.Busy, JSON.stringify({ 'data': { 'name': 'ProductOfferComp', 'value': false } }));
                
                this.logExService.saveObservableEx(err, this.constructor.name, 'getProduct', subs);
            }
        );
    }

    itemValueChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheCalculation');
    }

    delete(id: number): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.removeItem(id);
            }
        });
    }

    removeItem(id: number): void {
        const ind: number = this.host.ficheDto.ProductList.findIndex(x => x.Id == id);
        this.host.ficheDto.ProductList.splice(ind, 1);

        this.itemValueChanged();
    }

    checkQuantity(listItem: FicheProductDto, newValue: number): void {
        listItem.Quantity = this.ficheService.checkQuantity(newValue);

        this.itemValueChanged();
    }
}