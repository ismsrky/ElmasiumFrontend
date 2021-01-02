import { WsNotificationGroupTypes } from "../../enum/sys/ws-notify-group-types.enum";

export class PersonNotifyListDto {
    constructor() {
        this.PersonId = null;
        this.WsNotificationGroupTypeId = null;
    }

    PersonId: number;
    WsNotificationGroupTypeId: WsNotificationGroupTypes;
}