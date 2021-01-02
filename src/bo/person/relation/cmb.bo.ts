import { RelationTypes } from "../../../enum/person/relation-types.enum";
import { PersonRelationListDto } from "../../../dto/person/relation/list.dto";

export class PersonRelationCmbBo {
    relationTypeId: RelationTypes;

    relationList: PersonRelationListDto[];
}