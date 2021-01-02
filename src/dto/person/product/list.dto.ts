import { ProductTypes } from "../../../enum/product/types.enum";
import { ProductPriceDto } from "../../product/price/price.dto";
import { ProductCodeDto } from "../../product/code/code.dto";

export class PersonProductListDto {
    constructor() {
        this.Id = null;

        this.ProductId = null;
        this.ProductName = null;
        this.ProductTypeId = null;

        this.PurchaseVatRate = 0;
        this.SaleVatRate = 0;
        this.Balance = 0;

        this.Price = null;

        this.PortraitImageUniqueIdStr = null;
        this.CodeList = null;

        this.Checked = false;
        this.IsActivitiesOpen = false;
        this.ProductProfileUrl = null;
    }

    Id: number;

    ProductId: number;
    ProductName: string;
    ProductTypeId: ProductTypes;

    PurchaseVatRate: number;
    SaleVatRate: number;
    Balance: number;

    Price: ProductPriceDto;

    PortraitImageUniqueIdStr: string;
    CodeList: ProductCodeDto[];

    Checked: boolean; // Shadow property
    IsActivitiesOpen: boolean; // Shadow property
    ProductProfileUrl: string; // Shadow property
}