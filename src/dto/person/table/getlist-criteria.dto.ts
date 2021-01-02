import { PersonTableStats } from "../../../enum/person/table-stats.enum";

export class PersonTableGetListCriteriaDto {
    constructor() {
        this.GroupId = null;
        this.PersonTableStatId = null;
    }

    GroupId: number; // not null
    PersonTableStatId: PersonTableStats; // null. Null means all.
}