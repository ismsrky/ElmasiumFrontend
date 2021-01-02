import { ProductTypes } from "../../../enum/product/types.enum";
import { Currencies } from "../../../enum/person/currencies.enum";
import { ProductCodeDto } from "../../product/code/code.dto";

export class PersonProductProfileDto {
    constructor() {
        this.PersonProductId = null;
        this.CategoryId = null;
        this.OnlineSalePrice = null;
        this.SalePrice = null;
        this.StarCount = 0;
        this.StarSum = 0;
        this.Balance = 0;
        this.Notes = null;
        this.IsSaleForOnline = null;
        this.IsTemporarilyUnavaible = null;
        this.StarAverage = 0;

        this.IsShopOwner = false;

        this.ProductId = null;
        this.ProductTypeId = null;
        this.ProductName = null;

        this.ShopId = null;
        this.ShopFullName = null;
        this.ShopStarCount = 0;
        this.ShopStarSum = 0;
        this.ShopDefaultCurrencyId = null;
        this.ShopUrlName = null;
        this.ShopIsAvailable = false;
        this.ShopTypeName = null;

        this.ShopStarAverage = 0;

        this.PortraitImageUniqueIdStr = null;

        this.CodeList = null;
    }

    PersonProductId: number; // not null
    CategoryId: number; // not null
    OnlineSalePrice: number; // null
    SalePrice: number; // not null
    StarCount: number; // not null
    StarSum: number; // not null
    Balance: number; // not null
    Notes: string; // null
    IsSaleForOnline: boolean; // not null
    IsTemporarilyUnavaible: boolean; // not null
    StarAverage: number; // Shadow property

    IsShopOwner: boolean;

    ProductId: number; // not null
    ProductTypeId: ProductTypes; // not null
    ProductName: string; // not null

    ShopId: number; // not null
    ShopFullName: string; // not null
    ShopStarCount: number; // not null
    ShopStarSum: number; // not null
    ShopDefaultCurrencyId: Currencies; // not null
    ShopUrlName: string; // not null
    ShopIsAvailable: boolean; // not null
    ShopTypeName: string; // not null

    PortraitImageUniqueIdStr: string; // null

    CodeList: ProductCodeDto[];

    ShopStarAverage: number; // Shadow property
}