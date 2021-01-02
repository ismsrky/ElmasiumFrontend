import { ApprovalStats } from "../../enum/approval/stats.enum";

export class FicheApprovalHistoryListDto {
    constructor() {
        this.Id = null;
        this.ApprovalStatId = null;
        this.PersonId = null;
        this.PersonFullName = null;
        this.CreateDateNumber = null;
    }

    Id: number;
    ApprovalStatId: ApprovalStats;
    PersonId: number;
    PersonFullName: string;
    CreateDateNumber: number;
}