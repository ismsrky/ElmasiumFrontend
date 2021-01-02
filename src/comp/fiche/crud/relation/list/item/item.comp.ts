import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';

// Components
import { FicheRelationListIndexComp } from '../index.comp';

// Dto
import { PersonRelationListDto } from '../../../../../../dto/person/relation/list.dto';

// Enums
import { Currencies } from '../../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../../enum/sys/stats.enum';
import { AccountTypes } from '../../../../../../enum/person/account-type.enum';
import { FicheProductDto } from '../../../../../../dto/fiche/product/product.dto';
import { FicheListDto } from '../../../../../../dto/fiche/list.dto';
import { FicheTypeFakes } from '../../../../../../enum/fiche/type-fakes.enum';
import { ApprovalStats } from '../../../../../../enum/approval/stats.enum';
import { FicheTypes } from '../../../../../../enum/fiche/types.enum';
import { PaymentStats } from '../../../../../../enum/fiche/payment-stats.enum';

@Component({
    selector: 'fiche-relation-list-item',
    templateUrl: './item.comp.html'
})
export class FicheRelationListItemComp implements OnInit, OnDestroy {
    host: FicheRelationListIndexComp;
    constructor(@Host() host: FicheRelationListIndexComp) {
        this.host = host;
    }

    @Input('listItem') listItem: FicheListDto;

    currencies = Currencies;
    stats = Stats;
    accountTypes = AccountTypes;
    ficheTypeFakes = FicheTypeFakes;
    approvalStats = ApprovalStats;
    ficheTypes = FicheTypes;
    paymentStats = PaymentStats;

    busy: boolean = false;

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}