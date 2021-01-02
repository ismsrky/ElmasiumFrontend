import { ProductTypes } from "../../../enum/product/types.enum";
import { ProductCodeDto } from "../../product/code/code.dto";
import { ProductPriceDto } from "../../product/price/price.dto";

export class PersonProductDto {
    constructor() {
        this.Id = null;
        this.PurchaseVatRate = 8;
        this.SaleVatRate = 8;
        this.CategoryId = null;
        this.Balance = 0;

        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = ProductTypes.xShopping;

        this.CodeList = null;
        this.Price = null;

        this.PortraitImageUniqueIdStr = null;
    }

    Id: number; // not null
    PurchaseVatRate: number; // not null
    SaleVatRate: number; // not null
    CategoryId: number; // null
    Balance: number; // not null

    ProductId: number; // not null
    ProductName: string; // not null
    ProductTypeId: ProductTypes; // not null

    CodeList: ProductCodeDto[]; // not null
    Price: ProductPriceDto; // not null

    PortraitImageUniqueIdStr: string; // null
}