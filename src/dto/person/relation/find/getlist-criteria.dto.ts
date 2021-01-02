import { RelationTypes } from "../../../../enum/person/relation-types.enum";

export class PersonRelationFindGetListCriteriaDto {
    constructor() {
        this.ParentPersonId = null;

        this.Name = null;
        this.RelationTypeId = null;
    }

    ParentPersonId: number; // this the person who searching.
    Name: string;
    RelationTypeId: RelationTypes;
}