import { PersonTypes } from "../../../enum/person/person-types.enum";
import { RelationTypes } from "../../../enum/person/relation-types.enum";

export class ApprovalRelationListDto {
    constructor() {
        this.ApprovalRelationId = null;

        this.ParentPersonId = null;
        this.ParentPersonTypeId = null;
        this.ParentPersonFullName = null;

        this.ChildPersonId = null;
        this.ChildPersonTypeId = null;
        this.ChildPersonFullName = null;

        this.RelationTypeId = null;

        this.CreateDateNumber = null;
    }

    ApprovalRelationId: number;

    ParentPersonId: number;
    ParentPersonTypeId: PersonTypes;
    ParentPersonFullName: string;

    ChildPersonId: number;
    ChildPersonTypeId: PersonTypes;
    ChildPersonFullName: string;

    RelationTypeId: RelationTypes;

    CreateDateNumber: number;
}