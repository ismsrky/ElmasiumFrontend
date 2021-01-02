import { BalanceStats } from "../../../enum/person/balance-stats.enum";
import { RelationTypes } from "../../../enum/person/relation-types.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonRelationGetListCriteriaDto {
    constructor() {
        this.PersonId = null;
        this.CurrencyId = null;

        this.IsOppositeOperation = false;
        this.SearchRelationTypeOpp = false;

        this.RelationTypeIdList = [];

        this.BalanceStatIdList = null;

        this.Name = null;

        this.PageOffSet = 0;

        this.PersonRelationId = null;
    }

    PersonId: number;
    CurrencyId: Currencies;
    RelationTypeIdList: RelationTypes[];

    IsOppositeOperation: boolean;
    SearchRelationTypeOpp: boolean; // make this true only when person search.

    BalanceStatIdList: BalanceStats[];

    Name: string;

    PageOffSet: number;

    // If you pass this param, sp will ignore most of params and just will search due given id.
    // and will return just only one row.
    PersonRelationId: number;
}