export class ProductCategoryGetListCriteriaDto {
    constructor() {
        this.ProductCategoryId = null;
        this.IsUpper = false;
    }

    ProductCategoryId: number; // not null. value 0 means root.
    IsUpper: boolean; // not null
}