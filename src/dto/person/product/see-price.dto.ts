import { ProductTypes } from "../../../enum/product/types.enum";
import { ProductCodeDto } from "../../product/code/code.dto";
import { ProductPriceDto } from "../../product/price/price.dto";

export class PersonProductSeePriceDto {
    constructor() {
        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null

        this.CodeList = null;
        this.Price = null;

        this.PortraitImageUniqueIdStr = null;

        this.PersonProductId = null;
    }

    ProductId: number; // not null
    ProductName: string; // not null
    ProductTypeId: ProductTypes; // not null

    CodeList: ProductCodeDto[]; // not null
    Price: ProductPriceDto[]; // not null

    PortraitImageUniqueIdStr: string; // null

    PersonProductId: number; // null. null means this product is not in the inventory of the given shop and came from the pool.
}