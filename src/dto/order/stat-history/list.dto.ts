import { OrderStats } from "../../../enum/order/stats.enum";
import { OrderStatListDto } from "../stat-list.dto";

export class OrderStatHistoryListDto {
    constructor() {
        this.Id = null;
        this.OrderStatId = null;

        this.ParentPersonId = null;
        this.ParentPersonFullName = null;

        this.Notes = null;
        this.CreateDateNumber = null;

        this.OrderStat = null;
    }

    Id: number; // not null
    OrderStatId: OrderStats; // not null

    ParentPersonId: number; // not null
    ParentPersonFullName: string; // not null

    Notes: string; // null
    CreateDateNumber: number; // not null

    OrderStat: OrderStatListDto; // Shadow property
}