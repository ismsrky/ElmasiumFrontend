import { DictionaryService } from "../../../service/dictionary/dictionary.service";

import { PersonRelationSubListDto } from "./sub-list.dto";

import { PersonTypes } from "../../../enum/person/person-types.enum";
import { RelationTypes } from "../../../enum/person/relation-types.enum";
import { Currencies } from "../../../enum/person/currencies.enum";
import { BalanceStats } from "../../../enum/person/balance-stats.enum";

export class PersonRelationListDto {
    dicService: DictionaryService;
    constructor(dicService: DictionaryService) {
        this.dicService = dicService;

        this.Id = null;

        this.RelatedPersonId = null;
        this.RelatedPersonTypeId = null;
        this.RelatedPersonFullName = null;
        this.RelatedPersonDefaultCurrencyId = null;
        this.RelatedPersonUrlName = null;

        this.IsMaster = null;
        this.IsAlone = null;

        this.Balance = 0;
        this.BalanceStatId = null;

        this.Caption = '';
        this.RelationTypesStr = '';

        this.RelationSubList = null;

        this.Checked = false;
        this.IsActivitiesOpen = false;
        this.IsAlonePersonOpen = false;
        this.IsFicheOperationsOpen = false;
        this.IsFicheOpen = false;
    }

    Id: number;

    RelatedPersonId: number;
    RelatedPersonTypeId: PersonTypes;
    RelatedPersonFullName: string;
    RelatedPersonDefaultCurrencyId: Currencies;
    RelatedPersonUrlName: string;

    IsMaster: boolean;
    IsAlone: boolean;

    Balance: number;
    BalanceStatId: BalanceStats;

    Caption: string;

    RelationTypesStr: string;

    RelationSubList: PersonRelationSubListDto[]; // cant be null or empty, server must give at least one record.

    Checked: boolean; // Shadow property
    IsActivitiesOpen: boolean; // Shadow property
    IsAlonePersonOpen: boolean; // Shadow property
    IsFicheOperationsOpen: boolean; // Shadow property
    IsFicheOpen: boolean; // Shadow property

    copy(dto: PersonRelationListDto): void {
        this.Id = dto.Id;

        this.IsMaster = dto.IsMaster;
        this.IsAlone = dto.IsAlone;
        this.RelatedPersonFullName = dto.RelatedPersonFullName;
        this.RelatedPersonId = dto.RelatedPersonId;
        this.RelatedPersonTypeId = dto.RelatedPersonTypeId;

        this.RelationSubList = [];
        dto.RelationSubList.forEach(element => {
            let newElement = new PersonRelationSubListDto();
            newElement.copy(element);

            this.RelationSubList.push(newElement);
        });

        this.Balance = dto.Balance;
        this.BalanceStatId = dto.BalanceStatId;
        this.RelatedPersonDefaultCurrencyId = dto.RelatedPersonDefaultCurrencyId;
        this.RelatedPersonUrlName = dto.RelatedPersonUrlName;
        //this.ApprovalStatId = dto.ApprovalStatId;
        //this.RelationTypeIdList = dto.RelationTypeIdList;
    }

    handleRelationTypes(): void {
        this.RelationTypesStr = '';
        this.RelationSubList.forEach(element => {
            this.RelationTypesStr += this.dicService.getValue(RelationTypes[element.RelationTypeId]) + ',';
        });
        this.RelationTypesStr = this.RelationTypesStr.substring(0, this.RelationTypesStr.length - 1);
    }

    handleCaption(forList: boolean): void {
        if ((forList == false && this.RelatedPersonTypeId == null)) {
            this.Caption = '';
            return;
        }
        let strRelationTypes: string = '';
        this.RelationSubList.forEach(element => {
            strRelationTypes += this.dicService.getValue(RelationTypes[element.RelationTypeId]) + ', ';
        });
        strRelationTypes = strRelationTypes.substring(0, strRelationTypes.length - 2);

        if (forList) {
            this.Caption = strRelationTypes;
        } else {
            this.Caption = this.RelatedPersonFullName + ' (' + this.dicService.getValue(PersonTypes[this.RelatedPersonTypeId])
                + ' / ' + strRelationTypes + ')';
        }
    }
}