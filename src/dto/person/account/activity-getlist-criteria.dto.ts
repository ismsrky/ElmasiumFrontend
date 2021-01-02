import { ApprovalStats } from "../../../enum/approval/stats.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonAccountActivityGetListCriteriaDto {
    constructor() {
        this.OwnerPersonId = null;
        this.AccountIdList = null;

        this.ApprovalStatIdList = null;

        // I purposely made their default value to null.
        this.GrandTotalMin = null;
        this.GrandTotalMax = null;

        this.CurrencyId = null;

        this.IssueDateStartNumber = null
        this.IssueDateStart = null;

        this.IssueDateEndNumber = null;
        this.IssueDateEnd = null;

        this.PageOffSet = 0;
    }

    OwnerPersonId: number;
    AccountIdList: number[];

    ApprovalStatIdList: ApprovalStats[];

    GrandTotalMin: number;
    GrandTotalMax: number;

    CurrencyId: Currencies;

    IssueDateStartNumber: number;
    IssueDateStart: Date; // Shadow property

    IssueDateEndNumber: number;
    IssueDateEnd: Date; // Shadow property

    PageOffSet: number;

    copy(dto: PersonAccountActivityGetListCriteriaDto): void {
        this.OwnerPersonId = dto.OwnerPersonId;
        this.AccountIdList = dto.AccountIdList;

        this.ApprovalStatIdList = dto.ApprovalStatIdList;

        this.GrandTotalMin = dto.GrandTotalMin;
        this.GrandTotalMax = dto.GrandTotalMax;

        this.CurrencyId = dto.CurrencyId;

        this.IssueDateStartNumber = dto.IssueDateStartNumber;
        this.IssueDateStart = dto.IssueDateStart;

        this.IssueDateEndNumber = dto.IssueDateEndNumber;
        this.IssueDateEnd = dto.IssueDateEnd;

        this.PageOffSet = dto.PageOffSet;
    }
}