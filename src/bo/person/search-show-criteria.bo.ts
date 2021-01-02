import { PersonTypes } from "../../enum/person/person-types.enum";
import { PersonRelationListDto } from "../../dto/person/relation/list.dto";

// this class is used as a parameter class when showing 'PersonSearchIndexComp'.
export class PersonSearchShowCriteriaBo {
    constructor() {
        this.PersonId = null;
        this.PersonTypeId = null;
        this.IsOppositeOperation = false;
        
        this.Multiple = false;
        this.PreCheckedList = null;
    }

    PersonId: number;
    PersonTypeId: PersonTypes;
    IsOppositeOperation: boolean;

    Multiple: boolean;
    PreCheckedList: PersonRelationListDto[]; // This param can be used only when 'Multiple' param set to true.
}