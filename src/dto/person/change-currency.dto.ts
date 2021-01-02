import { Currencies } from "../../enum/person/currencies.enum";

export class PersonChangeSelectedCurrencyDto {
    constructor() {
        this.CurrencyId = null;
    }

    CurrencyId: Currencies;
}