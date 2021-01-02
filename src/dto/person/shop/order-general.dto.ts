import { AccountTypes } from "../../../enum/person/account-type.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class ShopOrderGeneralDto {
    constructor() {
        this.PersonId = null;

        this.TakesOrder = false;
        this.OrderAccountList = null;
        this.OrderCurrencyList = null;
    }

    PersonId: number;

    TakesOrder: boolean;
    OrderAccountList: AccountTypes[];
    OrderCurrencyList: Currencies[];
}