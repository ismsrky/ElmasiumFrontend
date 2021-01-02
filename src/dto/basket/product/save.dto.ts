import { Currencies } from "../../../enum/person/currencies.enum";

export class BasketProductSaveDto {
    constructor() {
        this.DebtPersonId = null;
        this.CreditPersonId = null;

        this.ProductId = null;
        this.Quantity = 1;

        this.CurrencyId = null;
        this.IsFastSale = false;

        this.OptionIdList = null;
        this.IncludeExcludeIdList = null;
    }

    DebtPersonId: number; // not null
    CreditPersonId: number; // not null

    ProductId: number; // not null
    Quantity: number; // not null and greater than 0.

    CurrencyId: Currencies; // not null
    IsFastSale: boolean; // not null. true means 'buy now' otherwise just add to the basket.

    OptionIdList: number[]; // not null if person product has option(s).
    IncludeExcludeIdList: number[]; // null
}