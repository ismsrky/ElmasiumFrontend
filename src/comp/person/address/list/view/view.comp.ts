import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// Comp

// Service

// Dto
import { PersonAddressListDto } from '../../../../../dto/person/address/address-list.dto';

// Enum
import { Stats } from '../../../../../enum/sys/stats.enum';
import { AddressTypes } from '../../../../../enum/person/address-types.enum';

@Component({
    selector: 'person-address-list-view',
    templateUrl: './view.comp.html'
})
export class PersonAddressListViewComp implements OnInit, OnDestroy {
    /**
     * Notes:
     * This comp is smilar to 'PersonAddressListItemComp' but this does not require any host and can work independently.
     */

    stats = Stats;
    addressTypes = AddressTypes;

    @Input('listItem') listItem: PersonAddressListDto;

    constructor() {
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}