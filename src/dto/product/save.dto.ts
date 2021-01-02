import { ProductTypes } from "../../enum/product/types.enum";
import { Currencies } from "../../enum/person/currencies.enum";

export class ProductSaveDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.ProductTypeId = null;

        this.PersonId = null;

        this.SalePrice = 2;
        this.PurhasePrice = 1;
        this.CurrencyId = Currencies.xTurkishLira;
        this.VatRate = 18;

        this.Barcode = null;

        this.ProductCode = null;
    }

    Id: number; // not null
    Name: string; // not null
    ProductTypeId: ProductTypes; // not null

    PersonId: number; // null. A record of 'PersonProduct' will be inserted if any value presented. Can be real or shop.

    SalePrice: number; // not null
    PurhasePrice: number; // not null
    CurrencyId: Currencies; // not null
    VatRate: number; // not null

    Barcode: string; // null. The value is ignored if 'ProductTypeId' is not 0. And it must be unique.

    ProductCode: string; // null. shadow property.
}