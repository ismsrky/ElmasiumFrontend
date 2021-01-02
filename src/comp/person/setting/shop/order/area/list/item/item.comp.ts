import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { PersonSettingShopOrderAreaListIndexComp } from '../index.comp';

// Service

// Dto
import { ShopOrderAreaListDto } from '../../../../../../../../dto/person/shop/order-area-list.dto';

// Bo

// Enum
import { OrderDeliveryTimes } from '../../../../../../../../enum/order/delivery-times.enum';
import { AddressBoundaries } from '../../../../../../../../enum/person/address-boundaries.enum';
import { Currencies } from '../../../../../../../../enum/person/currencies.enum';
import { Stc, expandCollapse } from '../../../../../../../../stc';
import { OrderDeliveryTypes } from '../../../../../../../../enum/order/delivery-types.enum';

@Component({
    selector: 'person-setting-shop-order-area-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class PersonSettingShopOrderAreaListItemComp implements OnInit, OnDestroy {
    host: PersonSettingShopOrderAreaListIndexComp;

    isNewAreaOpen: boolean = false;

    @Input('listItem') listItem: ShopOrderAreaListDto;

    busy: boolean = false;

    subsSaved: Subscription;

    addressBoundaries = AddressBoundaries;
    currencies = Currencies;
    orderDeliveryTimes = OrderDeliveryTimes;
    orderDeliveryTypes = OrderDeliveryTypes;

    hasStates: boolean = false;

    addArea: string = '';
    constructor(
        @Host() host: PersonSettingShopOrderAreaListIndexComp) {
        this.host = host;
    }

    ngOnInit(): void {
        // We getting first element, because area don't have to have a country, but sub area have to.
        this.hasStates = this.listItem.SubList[0].HasStates;

        switch (this.listItem.AddressBoundaryId) {
            case AddressBoundaries.xWorldwide:
                this.addArea = 'xAddCountry';
                break;
            case AddressBoundaries.xCountrywide:
                this.addArea = this.hasStates ? 'xAddState' : 'xAddCity';
                break;
            case AddressBoundaries.xStatewide:
                this.addArea = 'xAddCity';
                break;
            case AddressBoundaries.xCitywide:
                this.addArea = 'xAddDistrict';
                break;
            case AddressBoundaries.xDistrictwide:
                this.addArea = 'xAddLocality';
                break;
        }
    }
    ngOnDestroy(): void {
    }
}