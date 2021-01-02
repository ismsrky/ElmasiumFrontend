import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// Dto
import { FicheMoneyListDto } from '../../../../../dto/fiche/money/list.dto';

// Enum
import { AccountTypes } from '../../../../../enum/person/account-type.enum';
import { FicheListDto } from '../../../../../dto/fiche/list.dto';
import { ApprovalStats } from '../../../../../enum/approval/stats.enum';

@Component({
    selector: 'fiche-list-item-money-list',
    templateUrl: './money-list.comp.html'
})
export class FicheListItemMoneyListComp implements OnInit, OnDestroy {
    @Input('ficheListDto') ficheListDto: FicheListDto;
    @Input('ficheMoneyList') ficheMoneyList: FicheMoneyListDto[];

    accountTypes = AccountTypes;
    approvalStats = ApprovalStats;
    
    constructor() {
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}