import { ProductTypes } from "../../../enum/product/types.enum";

export class PersonProfileProductListDto {
    constructor() {
        this.Id = null;

        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null;

        this.OnlineSalePrice = 0;

        this.StarCount = 0;
        this.StarSum = 0;

        this.SaleVatRate = 0;
        this.Balance = 0;
        this.IsSaleForOnline = null;
        this.IsTemporarilyUnavaible = null;
        this.Notes = null;

        this.PortraitImageUniqueIdStr = null;

        this.ProductProfileUrl = null;
        this.StarAverage = 0;
        this.Busy = false;
    }

    Id: number; // not null

    ProductId: number; // not null
    ProductName: string; // not null
    ProductTypeId: ProductTypes; // not null

    OnlineSalePrice: number; // not null

    StarCount: number; // not null
    StarSum: number; // not null

    SaleVatRate: number; // not null
    Balance: number; // not null
    IsSaleForOnline: boolean; // not null
    IsTemporarilyUnavaible: boolean; // not null
    Notes: string; // null

    PortraitImageUniqueIdStr: string; // not null

    ProductProfileUrl: string; // Shadow property
    StarAverage: number; // Shadow property
    Busy: boolean; // Shadow property
}