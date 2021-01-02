import { AccountTypes } from "../../../enum/person/account-type.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonAccountGetFastRetailCriteriaDto {
    constructor() {
        this.CurrencyId = null;
        this.AccountTypeId = null;
    }

    CurrencyId: Currencies; // not null
    AccountTypeId: AccountTypes; // not null
}