import { ApprovalStats } from "../../../enum/approval/stats.enum";

export class ApprovalRelationSaveDto {
    constructor() {
        this.ApprovalRelationId = null;
        this.PersonRelationId = null;
        this.ApprovalStatId = null;
    }

    // One of following params must be passed.
    ApprovalRelationId: number;
    PersonRelationId: number;
    //////////////////////////////////////

    ApprovalStatId: ApprovalStats;
}