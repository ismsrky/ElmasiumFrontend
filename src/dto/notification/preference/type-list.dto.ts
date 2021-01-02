import { NotificationPreferenceListSubDto } from "./list-sub.dto";
import { NotificationPreferenceTypes } from "../../../enum/notification/preference-types.enum";

export class NotificationPreferenceTypeListDto {
    constructor() {
        this.NotificationPreferenceTypeId = null;
    }

    NotificationPreferenceTypeId: NotificationPreferenceTypes; // not null

    SubList: NotificationPreferenceListSubDto[]; // not null
}