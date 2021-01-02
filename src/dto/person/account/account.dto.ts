import { AccountTypes } from "../../../enum/person/account-type.enum";
import { Stats } from "../../../enum/sys/stats.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonAccountDto {
    constructor() {
        this.Id = null;
        this.AccountTypeId = null;
        this.StatId = Stats.xActive;
        this.CurrencyId = null;
        this.Name = null;
        this.Notes = null;

        this.IsFastRetail = false;
    }

    Id: number;
    Name: string;
    AccountTypeId: AccountTypes;
    CurrencyId: Currencies;
    StatId: Stats;
    Balance: number;
    Notes: string;

    IsFastRetail: boolean;
}