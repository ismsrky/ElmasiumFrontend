import { ApprovalStats } from "../../../enum/approval/stats.enum";
import { ProductTypes } from "../../../enum/product/types.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonProductActivityListDto {
    constructor() {
        this.Id = null;
        this.Quantity = 0;

        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null;
        this.IsDebt = false;

        this.OwnerPersonId = null;

        this.FicheId = null;
        this.FicheCurrencyId = null;
        this.FicheApprovalStatId = null;

        this.FicheIssueDateNumber = null;
    }

    Id: number;
    Quantity: number;

    ProductId: number;
    ProductName: string;
    ProductTypeId: ProductTypes;
    IsDebt: boolean; // debt or credit. No other options avabile.

    OwnerPersonId: number; // Person whose owner of this money account.

    FicheId: number; // which fiche does this activity belong?
    FicheCurrencyId: Currencies;
    FicheApprovalStatId: ApprovalStats;

    FicheIssueDateNumber: number;
}