import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';

// Comp
import { PersonAddressListIndexComp } from '../index.comp';

// Service

// Dto
import { PersonAddressListDto } from '../../../../../dto/person/address/address-list.dto';

// Enum
import { Stats } from '../../../../../enum/sys/stats.enum';
import { AddressTypes } from '../../../../../enum/person/address-types.enum';

@Component({
    selector: 'person-address-list-item',
    templateUrl: './item.comp.html'
})
export class PersonAddressListItemComp implements OnInit, OnDestroy {
    host: PersonAddressListIndexComp;

    stats = Stats;
    addressTypes = AddressTypes;

    @Input('listItem') listItem: PersonAddressListDto;

    constructor(@Host() host: PersonAddressListIndexComp) {
        this.host = host;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}