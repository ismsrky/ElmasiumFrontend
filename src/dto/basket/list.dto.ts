import { Currencies } from "../../enum/person/currencies.enum";
import { BasketProductListDto } from "./product/list.dto";

export class BasketListDto {
    constructor() {
        this.Id = null;
        this.DebtPersonId = null;
        this.CurrencyId = null;
        this.GrandTotal = 0;

        this.ShopId = null;
        this.ShopFullName = null;
        this.ShopUrlName = null;
        this.ShopStarCount = 0;
        this.ShopStarSum = 0;

        this.CreateDateNumber = null;
        this.UpdateDateNumber = null;

        this.ProductList = null;

        this.ShopStarAverage = 0;
    }

    Id: number; // not null
    DebtPersonId: number; // not null
    CurrencyId: Currencies; // not null
    GrandTotal: number; // not null

    ShopId: number; // not null
    ShopFullName: string; // not null
    ShopUrlName: string; // not null
    ShopStarCount: number; // not null
    ShopStarSum: number; // not null

    CreateDateNumber: number; // not null
    UpdateDateNumber: number; // null

    ProductList: BasketProductListDto[]; // not null and at least one row.

    ShopStarAverage: number; // Shadow property
}