import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';

// Component
import { PersonProductSearchListIndexComp } from '../index.comp';

// Dto
import { PersonProductListDto } from '../../../../../../dto/person/product/list.dto';

// Enum
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { CompBroadCastTypes } from '../../../../../../enum/sys/comp-broadcast-types.enum';
import { ProductTypes } from '../../../../../../enum/product/types.enum';

@Component({
    selector: 'person-product-search-list-item',
    templateUrl: './item.comp.html'
})
export class PersonProductSearchListItemComp implements OnInit, OnDestroy {
    constructor(
        private compBroadCastService: CompBroadCastService,
        @Host() host: PersonProductSearchListIndexComp) {
        this.host = host;
    }
    host: PersonProductSearchListIndexComp;
    @Input('listItem') listItem: PersonProductListDto;

    productTypes = ProductTypes;

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
    selectItem(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, this.listItem);
    }
}