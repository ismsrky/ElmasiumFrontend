import { AccountTypes } from "../../../enum/person/account-type.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class FicheMoneyDto {
    constructor() {
        this.Id = null;
        this.FicheId = null;

        this.CreditPersonAccountId = null;
        this.DebtPersonAccountId = null;

        this.Total = 0;

        this.DebtPersonAccountTypeId = null;
        this.CreditPersonAccountTypeId = null;

        this.Notes = null;

        this.CurrencyId = null;
        this.DebtPersonAccountName = null;
        this.CreditPersonAccountName = null;
    }

    Id: number;
    FicheId: number;

    DebtPersonAccountId: number;
    CreditPersonAccountId: number;

    Total: number;

    DebtPersonAccountTypeId: AccountTypes;
    CreditPersonAccountTypeId: AccountTypes;

    Notes: string;

    CurrencyId: Currencies; // Shadow property
    DebtPersonAccountName: string; // Shadow property
    CreditPersonAccountName: string; // Shadow property

    copy(dto: FicheMoneyDto): void {
        this.Id = dto.Id;
        this.FicheId = dto.FicheId;

        this.DebtPersonAccountId = dto.DebtPersonAccountId;
        this.CreditPersonAccountId = dto.CreditPersonAccountId;

        this.Total = dto.Total;

        this.DebtPersonAccountTypeId = dto.DebtPersonAccountTypeId;
        this.CreditPersonAccountTypeId = dto.CreditPersonAccountTypeId;

        this.Notes = dto.Notes;

        this.CurrencyId = dto.CurrencyId;
        this.DebtPersonAccountName = dto.DebtPersonAccountName;
        this.CreditPersonAccountName = dto.CreditPersonAccountName;
    }
}