import { RelationTypes } from "../../../enum/person/relation-types.enum";

export class ApprovalRelationRequestDto {
    constructor() {
        this.ChildRelationTypeId = null;

        this.ParentPersonId = null;
        this.ChildPersonId = null;
    }

    ChildRelationTypeId: RelationTypes;

    ParentPersonId: number;
    ChildPersonId: number;
}