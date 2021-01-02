import { RelationTypes } from "../../../enum/person/relation-types.enum";

export class PersonRelationHasCriteriaDto {
    constructor() {
        this.RelationTypeId = null;

        this.PersonId1 = null;
        this.PersonId2 = null;
    }

    RelationTypeId: RelationTypes; // not null

    PersonId1: number; // not null
    PersonId2: number; // null. null means operator person.
}