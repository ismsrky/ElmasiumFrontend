import { ProductTypes } from "../../../enum/product/types.enum";

export class ProductFilterListDto {
    constructor() {
        this.PersonProductId = null;
        this.OnlineSalePrice = 0;

        this.StarCount = 0;
        this.StarSum = 0;
        this.StarAverage = 0;

        this.Notes = null;

        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null;

        this.ShopId = null;
        this.ShopFullName = null;
        this.ShopUrlName = null;
        this.ShopStarCount = 0;
        this.ShopStarSum = 0;
        this.ShopTypeName = null;
        
        this.ShopStarAverage = 0;
    }

    PersonProductId: number; // not null
    OnlineSalePrice: number; // not null

    StarCount: number; // not null
    StarSum: number; // not null
    StarAverage: number; // not null. Shadow property.

    Notes: string; // null

    ProductId: number; // not null
    ProductName: string; // not null
    ProductTypeId: ProductTypes; // not null

    ShopId: number; // not null
    ShopFullName: string; // not null
    ShopUrlName: string; // not null
    ShopStarCount: number; // not null
    ShopStarSum: number; // not null
    ShopTypeName: string; // not null

    ShopStarAverage: number; // not null. Shadow property.
}