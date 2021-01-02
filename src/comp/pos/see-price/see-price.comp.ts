import { Component, ViewChild } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Service
import { PersonProductService } from '../../../service/person/product.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PersonProductSeePriceDto } from '../../../dto/person/product/see-price.dto';
import { PersonProductSeePriceGetCriteriaDto } from '../../../dto/person/product/see-price-get-criteria.dto';

// Bo
import { ProductOfferBo } from '../../../bo/product/offer.bo';
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { ProductTypes } from '../../../enum/product/types.enum';
import { ProductCodeTypes } from '../../../enum/product/code-types.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'pos-see-price',
    templateUrl: './see-price.comp.html',
    animations: [expandCollapse]
})
export class PosSeePriceComp {
    criteriaDto: PersonProductSeePriceGetCriteriaDto;

    offerBo: ProductOfferBo;

    productDto: PersonProductSeePriceDto;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    countDown: number = 10;

    timerReconnect = timer(200, 1000);
    subsReconnect: Subscription;

    profile: PersonProfileBo;

    busy: boolean = false;

    productTypes = ProductTypes;
    productCodeTypes = ProductCodeTypes;
    constructor(
        private personProductService: PersonProductService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
    }

    showModal(offerBo: ProductOfferBo, shopId: number): void {
        this.offerBo = offerBo;

        this.criteriaDto = new PersonProductSeePriceGetCriteriaDto();
        this.criteriaDto.ProductId = this.offerBo.ProductId;
        this.criteriaDto.ProductCode = this.offerBo.Code;
        this.criteriaDto.ShopId = shopId;
        this.criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        this.productDto = null;

        this.getSeePrice();

        let subsCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subsCloseModal);
                this.utils.unsubs(this.subsReconnect);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PosSeePriceComp');
            }
        );

        this.modal.show();
    }

    getSeePrice(): void {
        this.busy = true;
        let subs = this.personProductService.getSeePrice(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.productDto = x.Dto;

                    if (this.utils.isNull(this.productDto)) {
                        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({ 'PersonProductInPos': this.offerBo }));

                        this.modal.hide();
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }

                this.subsReconnect = this.timerReconnect.subscribe(
                    x => {
                        this.countDown--;

                        if (this.countDown <= 0) {
                            this.modal.hide();
                        }
                    }
                );
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getSeePrice', subs);
                this.busy = false;
            }
        );
    }
}