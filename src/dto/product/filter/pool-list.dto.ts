import { ProductTypes } from "../../../enum/product/types.enum";
import { ProductCodeDto } from "../code/code.dto";

export class ProductFilterPoolListDto {
    constructor() {
        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null;

        this.PortraitImageUniqueIdStr = null;

        this.CategoryId = null;

        this.ProductCodeList = null;

        this.PersonProductId = null;
        this.Balance = null;

        this.IsFocused = false;
    }

    ProductId: number; // not null
    ProductName: string; // not null
    ProductTypeId: ProductTypes; // not null

    PortraitImageUniqueIdStr: string; // null

    CategoryId: number; // null

    ProductCodeList: ProductCodeDto[]; // not null

    PersonProductId: number; // null
    Balance: number; // null

    IsFocused: boolean; // Shadow propery
}