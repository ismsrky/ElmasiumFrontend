import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonProductGeneralDto {
    constructor() {
        this.DefaultCurrencyId = null;

        this.PurchaseVatRate = null;
        this.SaleVatRate = null;

        this.PurhasePrice = null;
        this.SalePrice = null;
        this.OnlineSalePrice = null;

        this.IsTemporarilyUnavaible = null;
        this.IsSaleForOnline = null;
        this.Notes = null;
    }

    DefaultCurrencyId: Currencies; // not null

    PurchaseVatRate: number; // not null
    SaleVatRate: number; // not null

    PurhasePrice: number; // not null
    SalePrice: number; // not null
    OnlineSalePrice: number; // not null

    IsTemporarilyUnavaible: boolean; // not null
    IsSaleForOnline: boolean; // not null
    Notes: string; // null
}