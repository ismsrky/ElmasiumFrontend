/**
 * import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';

// Components
import { FicheMoneyListIndexComp } from '../index.comp';

// Dto
import { FicheMoneyDto } from '../../../../../../dto/fiche/money/money.dto';
import { PersonRelationListDto } from '../../../../../../dto/person/relation/list.dto';

// Enums
import { Currencies } from '../../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../../enum/sys/stats.enum';
import { AccountTypes } from '../../../../../../enum/person/account-type.enum';
import { FicheDto } from '../../../../../../dto/fiche/fiche.dto';

@Component({
    selector: 'fiche-money-list-item',
    templateUrl: './item.comp.html'
})
export class FicheMoneyListItemComp implements OnInit, OnDestroy {
    host: FicheMoneyListIndexComp;
    constructor(@Host() host: FicheMoneyListIndexComp) {
        this.host = host;
    }

    @Input('listItem') listItem: FicheMoneyDto;
    @Input('ficheDto') ficheDto: FicheDto;

    currencies = Currencies;
    stats = Stats;
    accountTypes = AccountTypes;

    busy: boolean = false;

    ngOnInit() {
    }
    ngOnDestroy() {
    }
}
 */