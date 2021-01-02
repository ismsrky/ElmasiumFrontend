import { Currencies } from "../../enum/person/currencies.enum";

export class BasketGetListCriteriaDto {
    constructor() {
        this.DebtPersonId = null;
        this.CurrencyId = null;

        this.BasketId = null;
    }

    DebtPersonId: number; // not null
    CurrencyId: Currencies; // not null

    BasketId: number; // null. to get just one row.
}