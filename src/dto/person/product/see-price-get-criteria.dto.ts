import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonProductSeePriceGetCriteriaDto {
    constructor() {
        this.ProductId = null;
        this.ProductCode = null;

        this.ShopId = null;

        this.CurrencyId = null;
    }

    // One of followings must be filled.
    ProductId: number; // null
    ProductCode: string; // null

    ShopId: number; // not null

    CurrencyId: Currencies; // not null
}