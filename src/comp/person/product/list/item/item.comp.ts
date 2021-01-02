import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';

// Comp
import { PersonProductListIndexComp } from '../index.comp';

// Service

// Dto
import { PersonProductListDto } from '../../../../../dto/person/product/list.dto';

// Enum
import { Currencies } from '../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../enum/sys/stats.enum';
import { ProductTypes } from '../../../../../enum/product/types.enum';
import { ProductCodeTypes } from '../../../../../enum/product/code-types.enum';
import { expandCollapse } from '../../../../../stc';
import { PersonTypes } from '../../../../../enum/person/person-types.enum';

@Component({
    selector: 'person-product-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class PersonProductListItemComp implements OnInit, OnDestroy {
    host: PersonProductListIndexComp;

    @Input('listItem') listItem: PersonProductListDto;

    currencies = Currencies;
    stats = Stats;
    productTypes = ProductTypes;
    productCodeTypes = ProductCodeTypes;
    personTypes = PersonTypes;

    isShowActivity: boolean = false;
    busy: boolean = false;

    constructor(@Host() host: PersonProductListIndexComp) {
        this.host = host;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}