import { Currencies } from "../../enum/person/currencies.enum";

export class PersonChangeMyPersonDto {
    constructor() {
        this.MyPersonId = null;
        this.PersonRelationId = null;
        this.DefaultCurrencyId = null;
    }

    MyPersonId: number;
    PersonRelationId: number;
    DefaultCurrencyId: Currencies;
}