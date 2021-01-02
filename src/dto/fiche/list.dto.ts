import { FicheTypes } from "../../enum/fiche/types.enum";
import { Currencies } from "../../enum/person/currencies.enum";
import { FicheContents } from "../../enum/fiche/contents.enum";
import { FicheContentGroups } from "../../enum/fiche/content-groups.enum";
import { PersonTypes } from "../../enum/person/person-types.enum";
import { ApprovalStats } from "../../enum/approval/stats.enum";
import { FicheTypeFakes } from "../../enum/fiche/type-fakes.enum";
import { PaymentStats } from "../../enum/fiche/payment-stats.enum";
import { UtilService } from "../../service/sys/util.service";

export class FicheListDto {
    constructor(private utils: UtilService) {
        this.Id = null;

        this.DebtPersonId = null;
        this.DebtPersonFullName = null;
        this.DebtPersonTypeId = null;
        this.DebtPersonIsAlone = null;

        this.CreditPersonId = null;
        this.CreditPersonFullName = null;
        this.CreditPersonTypeId = null;
        this.CreditPersonIsAlone = null;

        this.FicheTypeId = null;

        this.FicheContentId = null;
        this.FicheContentGroupId = null;

        this.CurrencyId = null;
        this.ApprovalStatId = null;
        this.PrintedCode = null;
        this.IncludingVat = false;

        this.PaymentStatId = null;
        this.PaidTotal = 0;

        this.IssueDateNumber = this.utils.getNow();
        this.IssueDate = new Date(this.IssueDateNumber);

        this.DueDateNumber = null;

        this.GrandTotal = 0;
        this.Total = 0;
        this.RowDiscountTotal = 0;

        this.UnderDiscountRate = 0;
        this.UnderDiscountTotal = 0;

        this.FicheTypeFakeId = null;
        this.IsDebtor = 1;

        this.Notes = null;

        this.LastApprovalFicheHistoryParentPersonId = null;
        this.LastApprovalFicheHistoryChildPersonId = null;
        this.LastApprovalStatId = null;

        this.Checked = false;
    }

    Id: number;

    DebtPersonId: number;
    DebtPersonFullName: string;
    DebtPersonTypeId: PersonTypes;
    DebtPersonIsAlone: boolean;

    CreditPersonId: number;
    CreditPersonFullName: string;
    CreditPersonTypeId = PersonTypes;
    CreditPersonIsAlone: boolean;

    FicheTypeId: FicheTypes;
    CurrencyId: Currencies;
    ApprovalStatId: ApprovalStats;
    PrintedCode: string;
    IncludingVat: boolean;

    PaymentStatId: PaymentStats;
    PaidTotal: number;

    FicheContentId: FicheContents;
    FicheContentGroupId: FicheContentGroups;

    IssueDate: Date; // Shadow property
    IssueDateNumber: number;

    DueDateNumber: number;

    GrandTotal: number;
    Total: number;
    RowDiscountTotal: number;

    UnderDiscountRate: number;
    UnderDiscountTotal: number;

    FicheTypeFakeId: FicheTypeFakes;
    IsDebtor: number;

    Notes: string;

    LastApprovalFicheHistoryParentPersonId: number; // nullable
    LastApprovalFicheHistoryChildPersonId: number; // nullable
    LastApprovalStatId: ApprovalStats; // nullable

    Checked: boolean; // Shadow property
}