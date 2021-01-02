import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';

// Comp
import { ApprovalFicheChoiceIndexComp } from '../index.comp';

// Service

// Dto
import { FicheMoneyDto } from '../../../../../dto/fiche/money/money.dto';

// Bo
import { PersonAccountCmbBo } from '../../../../../bo/person/account/cmb.bo';

// Enum
import { AccountTypes } from '../../../../../enum/person/account-type.enum';
import { Currencies } from '../../../../../enum/person/currencies.enum';

@Component({
    selector: 'approval-fiche-choice-item',
    templateUrl: './item.comp.html'
})
export class ApprovalFicheChoiceItemComp implements OnInit, OnDestroy {
    host: ApprovalFicheChoiceIndexComp;

    constructor(@Host() host: ApprovalFicheChoiceIndexComp) {
        this.host = host;
    }

    accountTypes = AccountTypes;

    @Input('ficheMoneyDto') ficheMoneyDto: FicheMoneyDto;
    @Input('personAccountCmbBo') personAccountCmbBo: PersonAccountCmbBo[]; // both for debt and credit
    @Input('currencyId') currencyId: Currencies;

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}