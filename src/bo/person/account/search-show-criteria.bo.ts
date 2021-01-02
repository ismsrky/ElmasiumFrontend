import { PersonAccountListDto } from "../../../dto/person/account/list.dto";

// this class is used as a parameter class when showing 'PersonSearchIndexComp'.
export class PersonAccountSearchShowCriteriaBo {
    constructor() {
        this.PersonId = null;

        this.Multiple = false;
        this.PreCheckedList = null;
    }

    PersonId: number;

    Multiple: boolean;
    PreCheckedList: PersonAccountListDto[]; // This param can be used only when 'Multiple' param set to true.
}