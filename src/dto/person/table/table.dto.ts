import { PersonTableStats } from "../../../enum/person/table-stats.enum";

export class PersonTableDto {
    constructor() {
        this.Id = null;

        this.GroupId = null;

        this.Name = null;
        this.PersonTableStatId = PersonTableStats.xAvailable;
        this.Order = 0;
        this.Notes;
    }

    Id: number; // null. null means new record otherwise update.

    GroupId: number; // not null

    Name: string; // not null
    PersonTableStatId: PersonTableStats; // not null
    Order: number; // not null
    Notes: string; // null
}