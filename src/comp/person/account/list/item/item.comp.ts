import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';

// Comp
import { PersonAccountListIndexComp } from '../index.comp';

// Service

// Dto
import { PersonAccountListDto } from '../../../../../dto/person/account/list.dto';

// Enum
import { Stats } from '../../../../../enum/sys/stats.enum';
import { AccountTypes } from '../../../../../enum/person/account-type.enum';
import { PersonTypes } from '../../../../../enum/person/person-types.enum';

@Component({
    selector: 'person-account-list-item',
    templateUrl: './item.comp.html'
})
export class PersonAccountListItemComp implements OnInit, OnDestroy {
    host: PersonAccountListIndexComp;

    @Input('listItem') listItem: PersonAccountListDto;

    stats = Stats;
    accountTypes = AccountTypes;
    personTypes = PersonTypes;

    busy: boolean = false;

    constructor(@Host() host: PersonAccountListIndexComp) {
        this.host = host;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}