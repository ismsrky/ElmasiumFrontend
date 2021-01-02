import { PersonTypes } from "../../enum/person/person-types.enum";
import { Currencies } from "../../enum/person/currencies.enum";
import { RelationTypes } from "../../enum/person/relation-types.enum";

export class PersonProfileBo {
    constructor() {
        this.PersonId = null;
        this.PersonTypeId = null;

        this.FullName = null;

        this.DefaultCurrencyId = null;
        this.SelectedCurrencyId = null;

        this.UrlName = null;

        this.RelationTypeIdList = null;
    }

    PersonId: number;
    PersonTypeId: PersonTypes;

    FullName: string;

    DefaultCurrencyId: Currencies;
    SelectedCurrencyId: Currencies;

    UrlName: string;

    RelationTypeIdList: RelationTypes[];
}