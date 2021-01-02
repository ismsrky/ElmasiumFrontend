import { Currencies } from "../../../enum/person/currencies.enum";
import { Stats } from "../../../enum/sys/stats.enum";
import { AccountTypes } from "../../../enum/person/account-type.enum";

export class PersonAccountListDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.AccountTypeId = null;
        this.CurrencyId = null;
        this.StatId = null;
        this.Balance = 0;
        this.IsFastRetail = false;

        this.Checked = false;
        this.IsCrudOpen = false;
        this.IsActivitiesOpen = false;
    }

    Id: number;
    Name: string;
    AccountTypeId: AccountTypes;
    CurrencyId: Currencies;
    StatId: Stats;
    Balance: number;

    IsFastRetail: boolean;

    Checked: boolean; // Shadow property
    IsCrudOpen: boolean; // Shadow property
    IsActivitiesOpen: boolean; // Shadow property

    copy(dto: PersonAccountListDto): void {
        this.Id = dto.Id;
        this.Name = dto.Name;
        this.AccountTypeId = dto.AccountTypeId;
        this.CurrencyId = dto.CurrencyId;
        this.StatId = dto.StatId;
        this.Balance = dto.Balance;
        this.IsFastRetail = dto.IsFastRetail;
    }
}