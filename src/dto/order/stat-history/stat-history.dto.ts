import { OrderStats } from "../../../enum/order/stats.enum";
import { AccountTypes } from "../../../enum/person/account-type.enum";

export class OrderStatHistoryDto {
    constructor() {
        this.OrderId = null;
        this.OrderStatId = null;

        this.PersonId = null;

        this.Notes = null;
        this.AccountTypeId = null;
    }

    Id: number; // null

    OrderId: number; // not null
    OrderStatId: OrderStats; // not null

    PersonId: number; // null

    Notes: string; // null or not null depends on.
    AccountTypeId: AccountTypes; // null or not null depends on.
}