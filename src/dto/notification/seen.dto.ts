export class NotificationSeenDto {
    constructor() {
        this.MyPersonId = null;
        this.NotificationIdList = null;
    }

    MyPersonId: number;
    NotificationIdList: number[];
}