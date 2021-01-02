import { Stats } from "../../../enum/sys/stats.enum";
import { Currencies } from "../../../enum/person/currencies.enum";
import { AccountTypes } from "../../../enum/person/account-type.enum";

export class PersonAccountGetListCriteriaDto {
    constructor() {
        this.OwnerPersonId = null;
        this.AccountTypeIdList = null;
        
        this.StatId = null;
        this.CurrencyId = null;
    }

    OwnerPersonId: number;

    AccountTypeIdList: AccountTypes[];
    StatId: Stats;
    CurrencyId: Currencies;
}