import { AccountTypes } from "../../../enum/person/account-type.enum";
import { Currencies } from "../../../enum/person/currencies.enum";
import { ApprovalStats } from "../../../enum/approval/stats.enum";

export class PersonAccountActivityListDto {
    constructor() {
        this.Id = null;
        this.Total = 0;

        this.AccountId = null;
        this.AccountName = null;
        this.AccountTypeId = null;
        this.IsDebt = false;

        this.OwnerPersonId = null;

        this.FicheId = null;
        this.FicheCurrencyId = null;
        this.FicheApprovalStatId = null;
        
        this.FicheIssueDateNumber = null;
    }

    Id: number;
    Total: number;

    AccountId: number;
    AccountName: string;
    AccountTypeId: AccountTypes;
    IsDebt: boolean; // debt or credit. No other options avabile.

    OwnerPersonId: number; // Person whose owner of this money account.

    FicheId: number; // which fiche does this activity belong?
    FicheCurrencyId: Currencies;
    FicheApprovalStatId: ApprovalStats;

    FicheIssueDateNumber: number;
}