import { PersonTypes } from "../../../../enum/person/person-types.enum";
import { ApprovalStats } from "../../../../enum/approval/stats.enum";
import { RelationTypes } from "../../../../enum/person/relation-types.enum";

export class PersonRelationFindListDto {
    constructor() {
        this.PersonId = null;
        this.PersonTypeId = null;
        this.FullName = null;

        this.TaxNumber = null;
        this.TaxOffice = null;
        this.Email = null;

        this.PersonRelationId = null;
        this.ApprovalStatId = null;
        this.ChildRelationTypeId = null;
        this.IsParent = false;
    }

    PersonId: number;
    PersonTypeId: PersonTypes;
    FullName: string;

    TaxNumber: string;
    TaxOffice: string;
    Email: string;

    PersonRelationId: number;
    ApprovalStatId: ApprovalStats;
    ChildRelationTypeId: RelationTypes;
    IsParent: boolean;
}