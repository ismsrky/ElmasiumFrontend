import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp

// Service
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonAddressGetListCriteriaDto } from '../../../../../dto/person/address/getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { Currencies } from '../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../enum/sys/stats.enum';
import { AddressTypes } from '../../../../../enum/person/address-types.enum';
import { expandCollapse } from '../../../../../stc';

@Component({
    selector: 'person-address-list-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class PersonAddressListCriteriaComp implements OnInit, OnDestroy {
    profile: PersonProfileBo;

    criteriaDto: PersonAddressGetListCriteriaDto;

    currencies = Currencies;
    stats = Stats;
    addressTypes = AddressTypes;
    addressTypeList = [];

    constructor(
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private utils: UtilService) {
        for (var enumMember in AddressTypes) {
            if (!isNaN(parseInt(enumMember, 10)) && parseInt(enumMember, 10) >= 0) { // negative values are system values and not for UI.
                this.addressTypeList.push({
                    key: parseInt(enumMember, 10),
                    value: this.dicService.getValue(AddressTypes[enumMember])
                });
            }
        }

        this.clear();
    }

    busy: boolean = false;

    ngOnInit(): void {       
    }
    ngOnDestroy(): void {
    }

    search(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonAddressListCriteria': this.criteriaDto }));
    }

    showInside(criteriaDto: PersonAddressGetListCriteriaDto): void {
        this.criteriaDto = criteriaDto;
    }

    clear(): void {
        this.criteriaDto = new PersonAddressGetListCriteriaDto();

        this.profile = this.localStorageService.personProfile;

        this.criteriaDto.AddressTypeIdList = [];

        this.criteriaDto.OwnerPersonId = this.profile.PersonId;

        this.search();
    }
}