import { ApprovalStats } from "../../../enum/approval/stats.enum";
import { RelationTypes } from "../../../enum/person/relation-types.enum";

export class PersonRelationSubListDto {
    constructor() {
        this.PersonRelationId = null;
        this.ApprovalStatId = null;

        this.RelationTypeId = null;

        this.ApprovalRelationId = null;
    }

    PersonRelationId: number;
    ApprovalStatId: ApprovalStats;

    RelationTypeId: RelationTypes;

    ApprovalRelationId: number; // can be null

    copy(dto: PersonRelationSubListDto): void {
        this.PersonRelationId = dto.PersonRelationId;
        this.ApprovalStatId = dto.ApprovalStatId;

        this.RelationTypeId = dto.RelationTypeId;

        this.ApprovalRelationId = dto.ApprovalRelationId;
    }
}