import { Currencies } from "../../../enum/person/currencies.enum";
import { StockStats } from "../../../enum/product/stock-stats-.enum";

export class PersonProfileProductGetListCriteriaDto {
    constructor() {
        this.PersonProductId = null;

        this.ShopId = null;
        this.CurrencyId = null;

        this.CategoryId = null;
        this.StockStatId = null;

        this.IsSaleForOnline = null;
        this.IsTemporarilyUnavaible = null;

        this.ProductNameCode = null;

        this.PageOffSet = 0;
    }

    PersonProductId: number; // null. If any value present, other params will be ignored.

    ShopId: number; // not null
    CurrencyId: Currencies; // not null

    CategoryId: number; // not null
    StockStatId: StockStats; // null

    IsSaleForOnline: boolean; // null
    IsTemporarilyUnavaible: boolean; // null

    ProductNameCode: string; // null. max lenght: 255. null means all.

    PageOffSet: number; // not null
}