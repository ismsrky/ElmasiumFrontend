import { NotificationChannels } from "../../../enum/notification/channels.enum";

export class NotificationPreferenceListSubDto {
    constructor() {
        this.Id = null;

        this.NotificationChannelId = null;

        this.Preference = null;
    }

    Id: number; // not null

    NotificationChannelId: NotificationChannels; // not null

    Preference: boolean; // not null
}