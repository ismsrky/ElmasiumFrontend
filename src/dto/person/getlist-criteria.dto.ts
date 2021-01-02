import { PersonTypes } from "../../enum/person/person-types.enum";
import { Currencies } from "../../enum/person/currencies.enum";

export class PersonGetListCriteriaDto {
    constructor() {
        this.PersonTypeIdList = null;
        this.CurrencyId = null;
    }

    PersonTypeIdList: PersonTypes[];
    CurrencyId: Currencies;
}