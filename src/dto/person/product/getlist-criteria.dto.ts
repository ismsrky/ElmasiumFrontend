import { ProductTypes } from "../../../enum/product/types.enum";
import { StockStats } from "../../../enum/product/stock-stats-.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonProductGetListCriteriaDto {
    constructor() {
        this.ProductNameCode = null;
        this.ProductTypeId = null;

        this.StockStatId = null;

        this.PersonId = null;
        this.CurrencyId = null;

        this.QuantityTotalMin = null;
        this.QuantityTotalMax = null;

        this.PageOffSet = 0;
    }

    ProductNameCode: string;
    ProductTypeId: ProductTypes;

    StockStatId: StockStats;

    PersonId: number; // not null. Can be real or shop.
    CurrencyId: Currencies;

    QuantityTotalMin: number;
    QuantityTotalMax: number;

    PageOffSet: number;
}