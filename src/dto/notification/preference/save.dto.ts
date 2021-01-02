import { NotificationPreferenceDto } from "./preference.dto";

export class NotificationPreferenceSaveDto {
    constructor() {
        this.PreferenceList = null;
    }

    PreferenceList: NotificationPreferenceDto[]; // not null and at least one row.
}