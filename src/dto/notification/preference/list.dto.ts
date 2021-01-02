import { PersonTypes } from "../../../enum/person/person-types.enum";
import { NotificationPreferenceTypeListDto } from "./type-list.dto";
import { RelationTypes } from "../../../enum/person/relation-types.enum";

export class NotificationPreferenceListDto {
    constructor() {
        this.RelatedPersonId = null;
        this.RelatedPersonFullName = null;
        this.RelatedPersonTypeId = null;

        this.RelationTypeId = null;

        this.TypeList = null;
    }

    RelatedPersonId: number; // not null
    RelatedPersonFullName: string; // not null
    RelatedPersonTypeId: PersonTypes; // not null

    RelationTypeId: RelationTypes; // not null

    TypeList: NotificationPreferenceTypeListDto[]; // not null
}