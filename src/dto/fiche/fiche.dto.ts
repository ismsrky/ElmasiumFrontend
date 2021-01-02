import { FicheTypes } from "../../enum/fiche/types.enum";
import { Currencies } from "../../enum/person/currencies.enum";
import { FicheMoneyDto } from "./money/money.dto";
import { FicheContents } from "../../enum/fiche/contents.enum";
import { FicheContentGroups } from "../../enum/fiche/content-groups.enum";
import { FicheProductDto } from "./product/product.dto";
import { FicheVatTotalDto } from "./vat-total.dto";
import { ApprovalStats } from "../../enum/approval/stats.enum";
import { FicheRelationSaveDto } from "./relation/save.dto";
import { Stc } from "../../stc";
import { UtilService } from "../../service/sys/util.service";

export class FicheDto {
    constructor(private utils: UtilService) {
        this.Id = null;
        this.DebtPersonId = null;
        this.CreditPersonId = null;

        this.FicheTypeId = null;

        this.FicheContentId = null;
        this.FicheContentGroupId = null;

        this.CurrencyId = null;
        this.ApprovalStatId = null;
        this.PrintedCode = null;
        this.IncludingVat = false;

        
        this.IssueDateNumber = this.utils.getNow();
        this.IssueDate = new Date(this.IssueDateNumber);

        this.DueDate = null;
        this.DueDateNumber = null;

        this.GrandTotal = 0;
        this.Total = 0;
        this.RowDiscountTotal = 0;

        this.UnderDiscountRate = 0;
        this.UnderDiscountTotal = 0;

        this.Notes = null;

        this.AcceptorPersonId = null;

        this.IsUncompleted = false;

        this.MoneyList = [];
        this.ProductList = [];
        this.VatTotalList = [];
        this.RelationList = [];

        this.IsDebtMaster = false;
        this.IsCreditMaster = false;
        this.LastChangeTime = this.utils.getNow();
    }

    Id: number;
    DebtPersonId: number;
    CreditPersonId: number;

    FicheTypeId: FicheTypes;

    FicheContentId: FicheContents;
    FicheContentGroupId: FicheContentGroups;

    CurrencyId: Currencies;
    ApprovalStatId: ApprovalStats;
    PrintedCode: string;
    IncludingVat: boolean;

    IssueDate: Date;
    IssueDateNumber: number;

    DueDate: Date;
    DueDateNumber: number;

    GrandTotal: number;
    Total: number;
    RowDiscountTotal: number;

    UnderDiscountRate: number;
    UnderDiscountTotal: number;

    Notes: string;

    AcceptorPersonId: number;

    IsUncompleted: boolean;

    MoneyList: FicheMoneyDto[];
    ProductList: FicheProductDto[];
    VatTotalList: FicheVatTotalDto[];
    RelationList: FicheRelationSaveDto[];

    IsDebtMaster: boolean; // shadow propery
    IsCreditMaster: boolean; // shadow propery
    LastChangeTime: number; // shadow propery
}