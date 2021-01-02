import { PersonProductListDto } from "../../../dto/person/product/list.dto";

// this class is used as a parameter class when showing 'PersonProductSearchIndexComp'.
export class PersonProductSearchShowCriteriaBo {
    constructor() {
        this.PersonId = null;

        this.Multiple = false;
        this.PreCheckedList = null;
    }

    PersonId: number;    

    Multiple: boolean;
    PreCheckedList: PersonProductListDto[]; // This param can be used only when 'Multiple' param set to true.
}