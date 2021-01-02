import { Component, OnInit, OnDestroy } from '@angular/core';

// Service
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';

// Dto
import { PersonAccountGetListCriteriaDto } from '../../../../../dto/person/account/getlist-criteria.dto';

// Bo
import { PersonAccountSearchShowCriteriaBo } from '../../../../../bo/person/account/search-show-criteria.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { AccountTypes } from '../../../../../enum/person/account-type.enum';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { Currencies } from '../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../enum/sys/stats.enum';

@Component({
    selector: 'person-account-search-criteria',
    templateUrl: './criteria.comp.html'
})
export class PersonAccountSearchCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: PersonAccountGetListCriteriaDto;
    criteriaBo: PersonAccountSearchShowCriteriaBo;

    accountTypes = AccountTypes;
    accountTypeList = [];

    currencies = Currencies;
    stats = Stats;

    busy: boolean = false;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService) {
        for (var enumMember in AccountTypes) {
            if (!isNaN(parseInt(enumMember, 10))) {
                this.accountTypeList.push({
                    key: parseInt(enumMember, 10),
                    value: this.dicService.getValue(AccountTypes[enumMember])
                });
            }
        }

        this.criteriaDto = new PersonAccountGetListCriteriaDto();
        this.criteriaDto.AccountTypeIdList = [];
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    selectionChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonAccountSearchCriteria': this.criteriaDto }));
    }

    show(criteriaBo: PersonAccountSearchShowCriteriaBo): void {
        this.criteriaBo = criteriaBo;

        this.criteriaDto.OwnerPersonId = this.criteriaBo.PersonId;

        this.criteriaDto.AccountTypeIdList = [];

        this.selectionChanged();
    }
}