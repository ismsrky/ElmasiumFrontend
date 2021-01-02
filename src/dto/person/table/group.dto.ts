import { PersonTableGroupStats } from "../../../enum/person/table-group-stats.enum";

export class PersonTableGroupDto {
    constructor() {
        this.Id = null;
        this.PersonId = null;

        this.Name = null;
        this.PersonTableGroupStatId = PersonTableGroupStats.xAvailable;
        this.Order = 0;
        this.Notes;
    }

    Id: number; // null. null means new record otherwise update.
    PersonId: number; // not null. The shop id.

    Name: string; // not null
    PersonTableGroupStatId: PersonTableGroupStats; // not null
    Order: number; // not null
    Notes: string; // null
}