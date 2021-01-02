import { OrderStats } from "../../enum/order/stats.enum";

export class ModalOrderStatHistorySaveBo {
    constructor() {
        this.Id = null;

        this.OrderId = null;
        this.OrderStatId = null;

        this.ShopId = null;
    }

    Id: number; // null

    OrderId: number; // not null
    OrderStatId: OrderStats; // not null

    ShopId: number; // not null
}