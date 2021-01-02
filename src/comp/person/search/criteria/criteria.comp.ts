import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// Service
import { PersonRelationService } from '../../../../service/person/relation.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonRelationGetListCriteriaDto } from '../../../../dto/person/relation/getlist-criteria.dto';
import { PersonRelationAvaibleTypeGetListCriteriaDto } from '../../../../dto/person/relation/avaible-getlist-criteria.dto';

// Bo
import { PersonSearchShowCriteriaBo } from '../../../../bo/person/search-show-criteria.bo';

// Enums
import { RelationTypes } from '../../../../enum/person/relation-types.enum';
import { PersonTypes } from '../../../../enum/person/person-types.enum';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { Stc } from '../../../../stc';

@Component({
    selector: 'person-search-criteria',
    templateUrl: './criteria.comp.html'
})
export class PersonSearchCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: PersonRelationGetListCriteriaDto;

    criteriaBo: PersonSearchShowCriteriaBo;
    avaibleRelationIdList = [];

    relationTypes = RelationTypes;
    personTypes = PersonTypes;

    modelChanged: Subject<string> = new Subject<string>();

    subsNameModelChange: Subscription;
    subsRelationModelChange: Subscription;

    nameControl = new FormControl();
    relationTypesControl = new FormControl();

    busy: boolean = false;

    constructor(
        private personRelationService: PersonRelationService,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private localStorageService: LocalStorageService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.criteriaDto = new PersonRelationGetListCriteriaDto();
    }

    ngOnInit(): void {
        this.subsNameModelChange = this.nameControl.valueChanges
            .pipe(
                debounceTime(Stc.typingEndTime)
            ).subscribe(newValue => {
                this.criteriaDto.Name = newValue;
                this.search();
            });

        this.subsRelationModelChange = this.relationTypesControl.valueChanges.subscribe(
            x => {
                this.criteriaDto.RelationTypeIdList = x;
                this.search();
            }
        )
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNameModelChange);
        this.utils.unsubs(this.subsRelationModelChange);
    }

    search(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonRelationSearchCriteria': this.criteriaDto }));
    }

    show(criteriaBo: PersonSearchShowCriteriaBo): void {
        this.criteriaBo = criteriaBo;

        this.clear();

        const criteriaDto = new PersonRelationAvaibleTypeGetListCriteriaDto();
        criteriaDto.PersonId = this.criteriaDto.PersonId;
        criteriaDto.ChildPersonTypeId = null;

        criteriaDto.OnlyMasters = !this.criteriaBo.IsOppositeOperation;
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
                this.logExService.saveObservableEx(err, this.constructor.name, 'show', subs);
            }
        );
    }

    clear(): void {
        this.criteriaDto = new PersonRelationGetListCriteriaDto();

        this.criteriaDto.CurrencyId = this.localStorageService.personProfile.DefaultCurrencyId;

        this.criteriaDto.RelationTypeIdList = [];

        this.criteriaDto.PersonId = this.criteriaBo.PersonId;

        this.criteriaDto.IsOppositeOperation = this.criteriaBo.IsOppositeOperation;
        this.criteriaDto.SearchRelationTypeOpp = true;

        this.criteriaDto.BalanceStatIdList = [];
    }
}

// Notes:
// Some of controls in this comp were made using reactive forms to do debounceTime.
// When you found how to do debounceTime without using reactive forms, remove reactive forms immediately.
// Using reactive forms costs us 100kb extra space.