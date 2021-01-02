import { Currencies } from "../../enum/person/currencies.enum";
import { OrderProductListDto } from "./product/list.dto";
import { PersonTypes } from "../../enum/person/person-types.enum";
import { OrderStats } from "../../enum/order/stats.enum";
import { OrderStatNextListDto } from "./stat-next-list.dto";
import { OrderStatListDto } from "./stat-list.dto";
import { PersonAddressListDto } from "../person/address/address-list.dto";
import { OrderStatHistoryListDto } from "./stat-history/list.dto";

export class OrderListDto {
    constructor() {
        this.Id = null;

        this.DebtPersonId = null;
        this.DebtPersonFullName = null;
        this.DebtPersonTypeId = null;

        this.CreditPersonId = null;
        this.CreditPersonFullName = null;
        this.CreditPersonTypeId = null;

        this.OrderStatId = null;
        this.CurrencyId = null;
        this.GrandTotal = 0;

        this.Notes = null;

        this.IsReturn = false;
        this.RelatedOrderId = null;

        this.BasketId = null;
        this.DeliveryAddressId = null;

        this.ShopId = null;
        this.ShopFullName = null;
        this.ShopUrlName = null;
        this.ShopStarCount = 0;
        this.ShopStarSum = 0;

        this.CommentId = null;
        this.IsCommentable = false;

        this.CreateDateNumber = null;
        this.UpdateDateNumber = null;

        this.Phone = null;

        this.ProductList = null;

        this.ShopStarAverage = 0;
        this.StatNextList = null;
        this.OrderStat = null;

        this.DeliveryAddressDto = null;

        this.StatHistoryList = null;

        this.isOpenAddress = false;
        this.isOpenHistory = false;

        this.xCommentCaption = null;
    }

    Id: number; // not null

    DebtPersonId: number; // not null
    DebtPersonFullName: string; // not null
    DebtPersonTypeId: PersonTypes; // not null

    CreditPersonId: number; // not null
    CreditPersonFullName: string; // not null
    CreditPersonTypeId: PersonTypes; // not null

    OrderStatId: OrderStats;
    CurrencyId: Currencies; // not null
    GrandTotal: number; // not null

    Notes: string; // null

    IsReturn: boolean; // not null
    RelatedOrderId: number; // null

    BasketId: number; // not null
    DeliveryAddressId: number; // not null

    ShopId: number; // not null
    ShopFullName: string; //  not null
    ShopUrlName: string; // not null
    ShopStarCount: number; // not null
    ShopStarSum: number; // not null

    CommentId: number; // null
    IsCommentable: boolean; // not null

    CreateDateNumber: number; // not null
    UpdateDateNumber: number; // null

    Phone: string; // null

    ProductList: OrderProductListDto[]; // not null and at least one row.

    ShopStarAverage: number; // Shadow property
    StatNextList: OrderStatNextListDto[]; // Shadow property
    OrderStat: OrderStatListDto; // Shadow property

    DeliveryAddressDto: PersonAddressListDto; // Shadow property

    StatHistoryList: OrderStatHistoryListDto[]; // Shadow property

    isOpenAddress: boolean; // Shadow property
    isOpenHistory: boolean; // Shadow property

    xCommentCaption: string; // Shadow property
}