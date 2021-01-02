import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';

//Components
import { PersonRelationListIndexComp } from '../index.comp';

// Service
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';

// Dto
import { PersonRelationListDto } from '../../../../../dto/person/relation/list.dto';

// Enums
import { PersonTypes } from '../../../../../enum/person/person-types.enum';
import { RelationTypes } from '../../../../../enum/person/relation-types.enum';
import { BalanceStats } from '../../../../../enum/person/balance-stats.enum';
import { Currencies } from '../../../../../enum/person/currencies.enum';
import { expandCollapse } from '../../../../../stc';
import { FicheTypeFakes } from '../../../../../enum/fiche/type-fakes.enum';

@Component({
    selector: 'person-relation-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class PersonRelationListItemComp implements OnInit, OnDestroy {
    host: PersonRelationListIndexComp;
    constructor(@Host() host: PersonRelationListIndexComp,
        private localStorageService: LocalStorageService) {
        this.host = host;
    }

    @Input('listItem') listItem: PersonRelationListDto;
    currencyId: Currencies;
    ficheTypeFakes = FicheTypeFakes;

    personTypes = PersonTypes;
    relationTypes = RelationTypes;
    balanceStats = BalanceStats;

    busy: boolean = false;

    ngOnInit(): void {
        this.currencyId = this.localStorageService.personProfile.SelectedCurrencyId;
    }
    ngOnDestroy(): void {
    }
}