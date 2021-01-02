import { PersonTableGroupStats } from "../../../enum/person/table-group-stats.enum";

export class PersonTableGroupGetListCriteriaDto {
    constructor() {
        this.PersonId = null;
        this.PersonTableGroupStatId = null;
    }

    PersonId: number; // not null. The shop id
    PersonTableGroupStatId: PersonTableGroupStats; // null. Null means all.
}