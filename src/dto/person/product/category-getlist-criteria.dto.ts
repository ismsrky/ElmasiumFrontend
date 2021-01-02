import { ProductTypes } from "../../../enum/product/types.enum";
import { StockStats } from "../../../enum/product/stock-stats-.enum";

export class PersonProductCategoryGetListCriteriaDto {
    constructor() {
        this.ProductTypeId = null;
        this.PersonId = null;

        this.IsSaleForOnline = null;
        this.IsTemporarilyUnavaible = null;

        this.StockStatId = null;

        this.ProductNameCode = null;
    }

    ProductTypeId: ProductTypes; // not null
    PersonId: number; // not null

    IsSaleForOnline: boolean; // null. null means all.
    IsTemporarilyUnavaible: boolean; // null. null means all.

    StockStatId: StockStats; // null. null means all.

    ProductNameCode: string; // null. max lenght: 255. null means all.
}