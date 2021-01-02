import { ProductTypes } from "../../../enum/product/types.enum";
import { ProductCodeDto } from "../../product/code/code.dto";
import { OptionDto } from "../../option/option.dto";
import { IncludeExcludeDto } from "../../include-exclude/include-exclude.dto";

export class BasketProductListDto {
    constructor() {
        this.Id = null;
        this.Quantity = 0;
        this.UnitPrice = 0;
        this.GrandTotal = 0;
        this.Notes = null;

        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null;

        this.PersonProductId = null;
        this.CategoryId = null;
        this.Balance = 0;
        this.StarCount = 0;
        this.StarSum = 0;

        this.CodeList = null;

        this.OptionList = null;
        this.IncludeExcludeList = null;

        this.PortraitImageUniqueIdStr = null;

        this.StarAverage = 0;
    }

    // Basket product
    Id: number; // not null
    Quantity: number; // not null
    UnitPrice: number; // not null
    GrandTotal: number; // not null
    Notes: string; // null

    // Product
    ProductId: number; // not null
    ProductName: string; // not null
    ProductTypeId: ProductTypes; // not null

    // Person product
    PersonProductId: number; // not null
    CategoryId: number; // not null
    Balance: number; // not null
    StarCount: number; // not null
    StarSum: number; // not null

    CodeList: ProductCodeDto[]; // not null and at least one row that stock code.

    OptionList: OptionDto[]; // null
    IncludeExcludeList: IncludeExcludeDto[]; // null

    PortraitImageUniqueIdStr: string; // null

    StarAverage: number; // Shadow property
}