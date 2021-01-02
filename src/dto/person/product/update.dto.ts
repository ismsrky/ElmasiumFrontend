import { ProductUpdateTypes } from "../../../enum/product/update-types.enum";

export class PersonProductUpdateDto {
    constructor() {
        this.PersonProductId = null;
        this.ProductUpdateTypeList = null;

        this.Name = null;

        this.CategoryId = null;

        this.PurchaseVatRate = null;
        this.SaleVatRate = null;

        this.PurhasePrice = null;
        this.SalePrice = null;
        this.OnlineSalePrice = null;

        this.IsTemporarilyUnavaible = null;
        this.IsSaleForOnline = null;
        this.Notes = null;
    }

    PersonProductId: number; // not null
    ProductUpdateTypeList: ProductUpdateTypes[]; // not null. At least one type is required.

    // value(s) to be updated. //
    // A value must not null or null if it is presented in 'ProductUpdateTypeList' otherwise it is ignored.
    Name: string;

    CategoryId: number; // not null it is presented.

    PurchaseVatRate: number; // not null it is presented.
    SaleVatRate: number; // not null it is presented.

    PurhasePrice: number; // not null it is presented.
    SalePrice: number; // not null it is presented.
    OnlineSalePrice: number; // not null it is presented.

    IsTemporarilyUnavaible: boolean; // not null it is presented.
    IsSaleForOnline: boolean; // not null it is presented.
    Notes: string; // not null it is presented. this is person product note, not product note.
    // value(s) to be updated. //
}