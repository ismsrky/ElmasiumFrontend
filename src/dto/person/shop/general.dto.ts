import { Currencies } from "../../../enum/person/currencies.enum";

export class ShopGeneralDto {
    constructor() {
        this.ShopId = 0;

        this.FullName = null;
        this.ShortName = null;
        this.ShopTypeId = null;

        this.IsIncludingVatPurhasePrice = false;
        this.IsIncludingVatSalePrice = true;

        this.DefaultCurrencyId = null;

        this.TaxOffice = null;
        this.TaxNumber = null;

        this.UrlName = null;

        this.Phone = null;
        this.Phone2 = null;
        this.Email = null;
    }

    ShopId: number;
    FullName: string;
    ShortName: string;
    ShopTypeId: number;

    IsIncludingVatPurhasePrice: boolean;
    IsIncludingVatSalePrice: boolean;

    DefaultCurrencyId: Currencies;

    TaxOffice: string;
    TaxNumber: string;

    UrlName: string;

    Phone: string;
    Phone2: string;
    Email: string;
}