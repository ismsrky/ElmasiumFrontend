import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subject, Observable } from 'rxjs';

// Service
import { ProductService } from '../../../../service/product/product.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { UtilService } from '../../../../service/sys/util.service';
import { ToastrService } from 'ngx-toastr';

// Dto
import { ProductFilterPoolGetListCriteriaDto } from '../../../../dto/product/filter/pool-getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { ProductTypes } from '../../../../enum/product/types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'product-offer-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class ProductOfferCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: ProductFilterPoolGetListCriteriaDto;

    private _eventBus: Subject<ProductFilterPoolGetListCriteriaDto>;

    profile: PersonProfileBo;

    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;

    productTypes = ProductTypes;

    busy: boolean = false;

    constructor(
        private productService: ProductService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private toastr: ToastrService) {
        this.profile = this.localStorageService.personProfile;
        this.criteriaDto = new ProductFilterPoolGetListCriteriaDto();

        this._eventBus = new Subject<ProductFilterPoolGetListCriteriaDto>();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(criteriaDto: ProductFilterPoolGetListCriteriaDto): Observable<ProductFilterPoolGetListCriteriaDto> {
        this.criteriaDto = criteriaDto;

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'ProductOfferCriteriaComp');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    ok(): void {
        this._eventBus.next(this.criteriaDto);
        this.modal.hide();
    }
    close(): void {
        this.modal.hide();
    }

    onlyInStockChange(): void {
        if (this.criteriaDto.OnlyInStock) {
            this.criteriaDto.OnlyInInventory = true;
        }
    }
}