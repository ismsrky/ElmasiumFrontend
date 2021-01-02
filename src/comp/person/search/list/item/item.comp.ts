import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';

// Component
import { PersonSearchListIndexComp } from '../index.comp';

// Dto
import { PersonRelationListDto } from '../../../../../dto/person/relation/list.dto';

// Enum
import { PersonTypes } from '../../../../../enum/person/person-types.enum';
import { RelationTypes } from '../../../../../enum/person/relation-types.enum';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'person-search-list-item',
    templateUrl: './item.comp.html'
})
export class PersonSearchListItemComp implements OnInit, OnDestroy {
    constructor(
        private compBroadCastService: CompBroadCastService,
        @Host() host: PersonSearchListIndexComp) {
        this.host = host;
    }
    host: PersonSearchListIndexComp;
    @Input('listItem') listItem: PersonRelationListDto;

    personTypes = PersonTypes;
    relationTypes = RelationTypes;

    ngOnInit() {
    }
    ngOnDestroy() {
    }
    selectItem(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, this.listItem);
    }
}