import { ProductTypes } from "../../../enum/product/types.enum";

export class FicheProductListDto {
    constructor() {
        this.Id = null;

        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null;

        this.Quantity = 0;
        this.UnitPrice = 0;

        this.Total = 0;

        this.DiscountRate = 0;
        this.DiscountTotal = 0;

        this.VatRate = 0;
        this.VatTotal = 0;

        this.GrandTotal = 0;

        this.Notes = null;

        this.IsDeleted = false;
    }

    Id: number;

    ProductId: number;
    ProductName: string;
    ProductTypeId: ProductTypes;

    Quantity: number;
    UnitPrice: number;

    Total: number;

    DiscountRate: number;
    DiscountTotal: number;

    VatRate: number;
    VatTotal: number;

    GrandTotal: number;

    Notes: string;

    IsDeleted: boolean;
}