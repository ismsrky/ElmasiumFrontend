import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Service
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';

// Dto
import { PersonAccountGetListCriteriaDto } from '../../../../../dto/person/account/getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { AccountTypes } from '../../../../../enum/person/account-type.enum';
import { Stats } from '../../../../../enum/sys/stats.enum';
import { Stc, expandCollapse } from '../../../../../stc';
import { UtilService } from '../../../../../service/sys/util.service';

@Component({
    selector: 'person-account-list-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class PersonAccountListCriteriaComp implements OnInit, OnDestroy {
    profile: PersonProfileBo;

    subsNeedRefresh: Subscription;

    criteriaDto: PersonAccountGetListCriteriaDto;

    stats = Stats;
    accountTypes = AccountTypes;
    accountTypeList = [];

    busy: boolean = false;

    constructor(
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private utils: UtilService) {
        for (var enumMember in AccountTypes) {
            if (!isNaN(parseInt(enumMember, 10))) {
                this.accountTypeList.push({
                    key: parseInt(enumMember, 10),
                    value: this.dicService.getValue(AccountTypes[enumMember])
                });
            }
        }

        this.clear();        
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.clear();
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    search(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonAccountListCriteria': this.criteriaDto }));
    }

    clear(): void {
        this.criteriaDto = new PersonAccountGetListCriteriaDto();

        this.profile = this.localStorageService.personProfile;

        this.criteriaDto.AccountTypeIdList = [];

        this.criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        this.criteriaDto.OwnerPersonId = this.profile.PersonId;

        this.search();
    }
}