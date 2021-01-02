import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp

// Service
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonProductGetListCriteriaDto } from '../../../../../dto/person/product/getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { CurrencyMaskConfig } from 'ngx-currency';
import { expandCollapse } from '../../../../../stc';

@Component({
    selector: 'person-product-list-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class PersonProductListCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: PersonProductGetListCriteriaDto;

    profile: PersonProfileBo;

    subsNeedRefresh: Subscription;

    configQuantity: CurrencyMaskConfig;

    showQuantity: boolean = false;

    busy: boolean = false;

    constructor(
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {
        this.configQuantity = this.utils.getQuantityMaskOptions();

        this.clear();
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.clear();
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    search(): void {
        if (this.criteriaDto.QuantityTotalMin < 0
            || this.criteriaDto.QuantityTotalMax < 0) {
            return;
        }
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonProductListCriteria': this.criteriaDto }));
    }

    clear(): void {
        this.criteriaDto = new PersonProductGetListCriteriaDto();

        this.profile = this.localStorageService.personProfile;

        this.criteriaDto.PersonId = this.profile.PersonId;
        this.criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        this.criteriaDto.ProductNameCode = '';

        this.search();
    }
}