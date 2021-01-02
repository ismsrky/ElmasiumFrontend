import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';

// Component
import { PersonAccountSearchListIndexComp } from '../index.comp';

// Dto
import { PersonAccountListDto } from '../../../../../../dto/person/account/list.dto';

// Enum
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { CompBroadCastTypes } from '../../../../../../enum/sys/comp-broadcast-types.enum';
import { AccountTypes } from '../../../../../../enum/person/account-type.enum';

@Component({
    selector: 'person-account-search-list-item',
    templateUrl: './item.comp.html'
})
export class PersonAccountSearchListItemComp implements OnInit, OnDestroy {
    constructor(
        private compBroadCastService: CompBroadCastService,
        @Host() host: PersonAccountSearchListIndexComp) {
        this.host = host;
    }
    host: PersonAccountSearchListIndexComp;
    @Input('listItem') listItem: PersonAccountListDto;

    accountTypes = AccountTypes;

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
    selectItem(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, this.listItem);
    }
}