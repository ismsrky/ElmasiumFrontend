import { OrderStats } from "../../enum/order/stats.enum";
import { OrderStatListDto } from "./stat-list.dto";

export class OrderStatNextListDto {
    constructor() {
        this.Id = null;

        this.OrderStatId = null;
        this.NextOrderStatId = null;

        this.ForDebt = false;
        this.ForReturn = false;

        this.NextOrderStat = null;
    }

    Id: number; // not null

    OrderStatId: OrderStats; // not null
    NextOrderStatId: OrderStats; // not null

    ForDebt: boolean; // not null
    ForReturn: boolean; // not null

    NextOrderStat: OrderStatListDto; // Shadow property
}