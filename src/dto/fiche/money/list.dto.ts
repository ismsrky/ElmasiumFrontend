import { AccountTypes } from "../../../enum/person/account-type.enum";

export class FicheMoneyListDto {
    constructor() {
        this.Id = null;
        this.Total = 0;

        this.DebtPersonAccountId = null;
        this.DebtPersonAccountName = null;

        this.CreditPersonAccountId = null;
        this.CreditPersonAccountName = null;

        this.DebtPersonAccountTypeId = null;
        this.CreditPersonAccountTypeId = null;

        this.Notes = null;
    }

    Id: number;
    Total: number;

    DebtPersonAccountId: number;
    DebtPersonAccountName: string;

    CreditPersonAccountId: number;
    CreditPersonAccountName: string;

    DebtPersonAccountTypeId: AccountTypes;
    CreditPersonAccountTypeId: AccountTypes;

    Notes: string;
}