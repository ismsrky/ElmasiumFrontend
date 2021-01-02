import { PersonTypes } from "../../../enum/person/person-types.enum";
import { RelationTypes } from "../../../enum/person/relation-types.enum";

export class PersonRelationRuleListDto {
    constructor() {
    }

    Id: number;

    ParentPersonTypeId: PersonTypes;
    ChildPersonTypeId: PersonTypes;

    ParentRelationTypeId: RelationTypes;
    ChildRelationTypeId: RelationTypes;
}