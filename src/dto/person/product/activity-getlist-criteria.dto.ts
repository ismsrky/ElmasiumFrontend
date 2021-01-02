import { ApprovalStats } from "../../../enum/approval/stats.enum";

export class PersonProductActivityGetListCriteriaDto {
    constructor() {
        this.OwnerPersonId = null;
        this.ProductIdList = null;

        this.ApprovalStatIdList = null;

        // I purposely made their default value to null.
        this.QuantityTotalMin = null;
        this.QuantityTotalMax = null;

        this.IssueDateStartNumber = null
        this.IssueDateStart = null;

        this.IssueDateEndNumber = null;
        this.IssueDateEnd = null;

        this.PageOffSet = 0;
    }

    OwnerPersonId: number;
    ProductIdList: number[];

    ApprovalStatIdList: ApprovalStats[];

    QuantityTotalMin: number;
    QuantityTotalMax: number;

    IssueDateStartNumber: number;
    IssueDateStart: Date; // Shadow property

    IssueDateEndNumber: number;
    IssueDateEnd: Date; // Shadow property

    PageOffSet: number;

    copy(dto: PersonProductActivityGetListCriteriaDto): void {
        this.OwnerPersonId = dto.OwnerPersonId;
        this.ProductIdList = dto.ProductIdList;

        this.ApprovalStatIdList = dto.ApprovalStatIdList;

        this.QuantityTotalMin = dto.QuantityTotalMin;
        this.QuantityTotalMax = dto.QuantityTotalMax;

        this.IssueDateStartNumber = dto.IssueDateStartNumber;
        this.IssueDateStart = dto.IssueDateStart;

        this.IssueDateEndNumber = dto.IssueDateEndNumber;
        this.IssueDateEnd = dto.IssueDateEnd;

        this.PageOffSet = dto.PageOffSet;
    }
}