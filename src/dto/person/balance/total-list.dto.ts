import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonBalanceTotalListDto {
    constructor() {
        this.CurrencyId = null;
        this.DebtTotal = 0;
        this.CreditTotal = 0;
    }

    CurrencyId: Currencies;
    DebtTotal: number;
    CreditTotal: number;
}

// This class is used to present whole debt and credit value of given person to everyone.