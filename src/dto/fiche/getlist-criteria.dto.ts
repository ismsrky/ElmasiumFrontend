import { FicheContents } from "../../enum/fiche/contents.enum";
import { ApprovalStats } from "../../enum/approval/stats.enum";
import { FicheTypeFakes } from "../../enum/fiche/type-fakes.enum";
import { Currencies } from "../../enum/person/currencies.enum";
import { PaymentStats } from "../../enum/fiche/payment-stats.enum";

export class FicheGetListCriteriaDto {
    constructor() {
        this.OtherPersonsIdList = null;
        this.FicheTypeFakeIdList = null;

        this.ApprovalStatIdList = null;
        this.FicheContentIdList = null;

        // I purposely made their default value to null.
        this.GrandTotalMin = null;
        this.GrandTotalMax = null;

        this.IssueDateStartNumber = null
        this.IssueDateStart = null;

        this.PrintedCode = null;

        this.IssueDateEndNumber = null;
        this.IssueDateEnd = null;

        this.CurrencyId = null;

        this.PaymentStatId = null;

        this.FicheId = null;

        this.FicheIdRelated = null;

        this.DebtPersonId = null;
        this.CreditPersonId = null;

        this.ExcludingFicheIdList = null;

        this.PageOffSet = 0;
    }

    OtherPersonsIdList: number[];
    FicheTypeFakeIdList: FicheTypeFakes[];

    ApprovalStatIdList: ApprovalStats[];
    FicheContentIdList: FicheContents[];

    GrandTotalMin: number;
    GrandTotalMax: number;

    IssueDateStartNumber: number;
    IssueDateStart: Date; // Shadow property

    PrintedCode: string;

    IssueDateEndNumber: number;
    IssueDateEnd: Date; // Shadow property

    CurrencyId: Currencies;

    PaymentStatId: PaymentStats;

    // If you pass this param, sp will ignore other params and just will search due given id.
    // and will return just only one row.
    FicheId: number;

    FicheIdRelated: number;

    DebtPersonId: number;
    CreditPersonId: number;

    ExcludingFicheIdList: number[];

    PageOffSet: number;

    copy(dto: FicheGetListCriteriaDto): void {
        this.OtherPersonsIdList = dto.OtherPersonsIdList;
        this.FicheTypeFakeIdList = dto.FicheTypeFakeIdList;

        this.ApprovalStatIdList = dto.ApprovalStatIdList;
        this.FicheContentIdList = dto.FicheContentIdList;

        this.GrandTotalMin = dto.GrandTotalMin;
        this.GrandTotalMax = dto.GrandTotalMax;

        this.IssueDateStartNumber = dto.IssueDateStartNumber;
        this.IssueDateStart = dto.IssueDateStart;

        this.PrintedCode = dto.PrintedCode;

        this.IssueDateEndNumber = dto.IssueDateEndNumber;
        this.IssueDateEnd = dto.IssueDateEnd;

        this.CurrencyId = dto.CurrencyId;

        this.PaymentStatId = dto.PaymentStatId;

        this.FicheId = dto.FicheId;

        this.FicheIdRelated = dto.FicheIdRelated;

        this.DebtPersonId = dto.DebtPersonId;
        this.CreditPersonId = dto.CreditPersonId;

        this.ExcludingFicheIdList = dto.ExcludingFicheIdList;
    }
}