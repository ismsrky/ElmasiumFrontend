export class ProductFilterGetListCriteriaDto {
    constructor() {
        this.SearchWord = null;
        this.ProductCategoryId = null;
        this.PropertyList = null;

        this.MinPrice = null;
        this.MaxPrice = null;

        this.PageNumber = 1;
    }

    SearchWord: string; // null. max length: 50
    ProductCategoryId: number; // not null
    PropertyList: string[];

    MinPrice: number; // null
    MaxPrice: number; // null

    PageNumber: number; // null. null means 1.
}