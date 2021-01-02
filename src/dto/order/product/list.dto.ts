import { ProductTypes } from "../../../enum/product/types.enum";
import { ProductCodeDto } from "../../product/code/code.dto";
import { OptionListDto } from "../../option/list.dto";
import { IncludeExcludeDto } from "../../include-exclude/include-exclude.dto";

export class OrderProductListDto {
    constructor() {
        this.Id = null;
        this.Quantity = 0;
        this.UnitPrice = 0;
        this.GrandTotal = 0;
        this.Notes = null;

        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null;

        this.CategoryId = null;
        this.StarCount = 0;
        this.StarSum = 0;

        this.CommentId = null;

        this.CodeList = null;

        this.PortraitImageUniqueIdStr = null;

        this.OptionList = null;
        this.IncludeExcludeList = null;

        this.IncludeList = null;
        this.ExcludeList = null;
        this.StarAverage = 0;

        this.xCommentCaption = null;
    }

    // Order product
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
    CategoryId: number; // not null
    StarCount: number; // not null
    StarSum: number; // not null

    CommentId: number; // null

    CodeList: ProductCodeDto[]; // not null and at least one row that stock code.

    PortraitImageUniqueIdStr: string; // null

    OptionList: OptionListDto[]; // null
    IncludeExcludeList: IncludeExcludeDto[]; // null

    IncludeList: IncludeExcludeDto[]; // Shadow property. List of includes in 'IncludeExcludeList'.
    ExcludeList: IncludeExcludeDto[]; // Shadow property. List of exludes in 'IncludeExcludeList'.
    StarAverage: number; // Shadow property

    xCommentCaption: string; // Shadow property
}