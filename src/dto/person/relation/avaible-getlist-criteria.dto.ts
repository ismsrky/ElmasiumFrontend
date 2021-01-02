import { PersonTypes } from "../../../enum/person/person-types.enum";

export class PersonRelationAvaibleTypeGetListCriteriaDto {
    constructor() {
        this.PersonId = null;
        this.ChildPersonTypeId = null;

        this.OnlySearchables = false;
        this.OnlyMasters = false;
    }

    PersonId: number;
    ChildPersonTypeId: PersonTypes;

    OnlySearchables: boolean;
    OnlyMasters: boolean;
}