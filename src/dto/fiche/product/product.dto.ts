import { ProductTypes } from "../../../enum/product/types.enum";
import { Currencies } from "../../../enum/person/currencies.enum";
import { ProductCodeDto } from "../../product/code/code.dto";

export class FicheProductDto {
    constructor() {
        this.Id = null;
        this.FicheId = null;
        this.ProductId = null;

        this.Quantity = 1;
        this.UnitPrice = 1;

        this.Total = 1;

        this.DiscountRate = 0;
        this.DiscountTotal = 0;

        this.VatRate = 0;
        this.VatTotal = 0;

        this.GrandTotal = 1;

        this.Notes = null;

        this.IsDeleted = false;

        this.CurrencyId = null;
        this.ProductName = null;
        this.ProductTypeId = null;

        this.PersonProductId = null;

        this.PortraitImageUniqueIdStr = null;

        this.FromPool = false;

        this.CodeList = null;

        this.IsNameInEdit = false;
        this.NameBeforeEdit = null;
    }

    Id: number;
    FicheId: number;
    ProductId: number;

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

    CurrencyId: Currencies; // Shadow property
    ProductName: string; // Shadow property
    ProductTypeId: ProductTypes; // Shadow property

    PersonProductId: number; // Shadow property

    PortraitImageUniqueIdStr: string; // Shadow property

    FromPool: boolean; // Shadow property

    CodeList: ProductCodeDto[]; // not null

    IsNameInEdit: boolean; // Shadow property
    NameBeforeEdit: string; // Shadow property

    copy(dto: FicheProductDto): void {
        this.Id = dto.Id;
        this.FicheId = dto.FicheId;
        this.ProductId = dto.ProductId;

        this.Quantity = dto.Quantity;
        this.UnitPrice = dto.UnitPrice;

        this.Total = dto.Total;

        this.DiscountRate = dto.DiscountRate;
        this.DiscountTotal = dto.DiscountTotal;

        this.VatRate = dto.VatRate;
        this.VatTotal = dto.VatTotal;

        this.GrandTotal = dto.GrandTotal;

        this.Notes = dto.Notes;
        this.IsDeleted = dto.IsDeleted;

        this.CurrencyId = dto.CurrencyId;
        this.ProductName = dto.ProductName;
        this.ProductTypeId = dto.ProductTypeId;

        this.PersonProductId = dto.PersonProductId;

        this.PortraitImageUniqueIdStr = dto.PortraitImageUniqueIdStr;

        this.FromPool = dto.FromPool;

        this.CodeList = dto.CodeList;

        this.IsNameInEdit = dto.IsNameInEdit;
        this.NameBeforeEdit = dto.NameBeforeEdit;
    }
}