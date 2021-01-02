import { PersonTableStats } from "../../../enum/person/table-stats.enum";

export class PersonTableCountsDto {
    constructor() {
        this.PersonTableStatId = null;
        this.Count = 0;
    }

    PersonTableStatId: PersonTableStats; // not null
    Count: number; // not null
}