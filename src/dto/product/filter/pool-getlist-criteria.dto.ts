import { ProductTypes } from "../../../enum/product/types.enum";

export class ProductFilterPoolGetListCriteriaDto {
    constructor() {
        this.ProductNameCode = null;
        this.ProductTypeId = null;
        this.ProductCategoryId = null;

        this.OnlyInInventory = false;
        this.OnlyInStock = false;

        this.PersonId = null;

        this.PageOffSet = 0;
    }

    ProductNameCode: string; // not null
    ProductTypeId: ProductTypes; // null
    ProductCategoryId: number; // null

    OnlyInInventory: boolean; // not null
    OnlyInStock: boolean; // not null

    PersonId: number; // not null. Can be real or shop.

    PageOffSet: number; // not null
}