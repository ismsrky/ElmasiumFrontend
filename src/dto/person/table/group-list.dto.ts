import { PersonTableGroupStats } from "../../../enum/person/table-group-stats.enum";
import { PersonTableCountsDto } from "./counts.dto";

export class PersonTableGroupListDto {
    constructor() {
        this.Id = null;

        this.Name = null;

        this.PersonTableGroupStatId = null;

        this.Order = 0;

        this.TableCountsList = null;
    }

    Id: number; // not null

    Name: string; // not null

    PersonTableGroupStatId: PersonTableGroupStats; // not null

    Order: number; // not null

    TableCountsList: PersonTableCountsDto[]; // not null
}