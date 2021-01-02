import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// Comp

// Service
import { PersonRelationService } from '../../../../../service/person/relation.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonRelationGetListCriteriaDto } from '../../../../../dto/person/relation/getlist-criteria.dto';
import { PersonRelationAvaibleTypeGetListCriteriaDto } from '../../../../../dto/person/relation/avaible-getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { Currencies } from '../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../enum/sys/stats.enum';
import { RelationTypes } from '../../../../../enum/person/relation-types.enum';
import { PersonTypes } from '../../../../../enum/person/person-types.enum';
import { BalanceStats } from '../../../../../enum/person/balance-stats.enum';
import { Stc, expandCollapse } from '../../../../../stc';

@Component({
    selector: 'person-relation-list-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class PersonRelationListCriteriaComp implements OnInit, OnDestroy {
    profile: PersonProfileBo;

    subsNeedRefresh: Subscription;

    criteriaDto: PersonRelationGetListCriteriaDto;

    subsNameModelChange: Subscription;

    showCriteria: boolean = true;

    relationTypes = RelationTypes;
    personTypes = PersonTypes;

    currencies = Currencies;
    stats = Stats;

    balanceStatList = [];
    avaibleRelationIdList = [];

    busy: boolean = false;

    nameControl = new FormControl();

    constructor(
        private personRelationService: PersonRelationService,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private logExService: LogExceptionService,
        private utils: UtilService        ) {
        for (var enumMember in BalanceStats) {
            if (!isNaN(parseInt(enumMember, 10))) {
                this.balanceStatList.push({
                    key: parseInt(enumMember, 10),
                    value: this.dicService.getValue(BalanceStats[enumMember])
                });
            }
        }
        this.clear();
    }

    ngOnInit(): void {
        this.subsNameModelChange = this.nameControl.valueChanges
            .pipe(
                debounceTime(Stc.typingEndTime)
            ).subscribe(newValue => {
                this.criteriaDto.Name = newValue;
                this.search();
            });

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.clear();
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNameModelChange);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    myPersonChanged(): void {
        const criteriaDto = new PersonRelationAvaibleTypeGetListCriteriaDto();
        criteriaDto.PersonId = this.criteriaDto.PersonId;
        criteriaDto.ChildPersonTypeId = null;
        let subs = this.personRelationService.getAvaibleTypeList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.criteriaDto.RelationTypeIdList = [];

                    this.avaibleRelationIdList = [];
                    let count: number = 0;
                    x.Dto.forEach(element => {
                        count++;

                        this.avaibleRelationIdList.push({
                            key: element,
                            value: this.dicService.getValue(RelationTypes[element])
                        });

                        if (count == x.Dto.length) {
                            this.search();
                        }
                    });

                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'myPersonChanged', subs);
            }
        );
    }

    search(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonRelationListCriteria': this.criteriaDto }));
    }

    clear(): void {
        this.criteriaDto = new PersonRelationGetListCriteriaDto();

        this.profile = this.localStorageService.personProfile;

        this.criteriaDto.CurrencyId = this.localStorageService.personProfile.SelectedCurrencyId;

        this.criteriaDto.RelationTypeIdList = [];

        this.criteriaDto.PersonId = this.profile.PersonId;

        this.criteriaDto.IsOppositeOperation = true;

        this.criteriaDto.BalanceStatIdList = [];

        this.myPersonChanged();
    }
}