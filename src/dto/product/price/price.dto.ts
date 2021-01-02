import { Currencies } from "../../../enum/person/currencies.enum";

export class ProductPriceDto {
    constructor() {
        this.PurhasePrice = 1;
        this.SalePrice = 2;
        this.OnlineSalePrice = 2;

        this.CurrencyId = null;

        this.FromPool = false;
    }

    PurhasePrice: number; // not null
    SalePrice: number; // not null
    OnlineSalePrice: number; // null

    CurrencyId: Currencies; // not null

    FromPool: boolean; // not null
}