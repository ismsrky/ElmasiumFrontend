import { Currencies } from "../../enum/person/currencies.enum";
import { OrderStats } from "../../enum/order/stats.enum";

export class OrderGetListCriteriaDto {
    constructor() {
        this.CaseId = null;

        this.PersonId = null;

        this.GetIncomings = false;
        this.GetReturns = false;
        this.OrderStatList = null;

        this.CurrencyId = null;

        this.PageOffSet = 0;
    }

    CaseId: number; // not null. // 0: Normal, 1: Top 10 and 'GetIncomings', 'GetReturns', 'OrderStatList', 'PageOffSet' params are ignored.

    PersonId: number; // not null

    GetIncomings: boolean; // not null
    GetReturns: boolean; // not null
    OrderStatList: OrderStats[]; // not null

    CurrencyId: Currencies; // not null

    PageOffSet: number; // not null
}