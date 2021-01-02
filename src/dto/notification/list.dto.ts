import { NotificationTypes } from "../../enum/general/notification-types.enum";
import { PersonTypes } from "../../enum/person/person-types.enum";
import { FicheTypes } from "../../enum/fiche/types.enum";
import { RelationTypes } from "../../enum/person/relation-types.enum";
import { Currencies } from "../../enum/person/currencies.enum";
import { ApprovalStats } from "../../enum/approval/stats.enum";
import { FicheTypeFakes } from "../../enum/fiche/type-fakes.enum";
import { OrderStats } from "../../enum/order/stats.enum";
import { OrderStatListDto } from "../order/stat-list.dto";

export class NotificationListDto {
    constructor() {
        this.NotificationId = null;
        this.NotificationTypeId = null;

        this.ParentRelationTypeId = null;
        this.ChildRelationTypeId = null;

        this.ParentPersonId = null;
        this.ParentPersonTypeId = null;
        this.ParentPersonFullName = null;

        this.ChildPersonId = null;
        this.ChildPersonTypeId = null;
        this.ChildPersonFullName = null;

        this.ApprovalStatId = null;

        this.FicheId = null;
        this.FicheTypeId = null;
        this.FicheGrandTotal == null;
        this.FicheCurrencyId = null;
        this.FicheTypeFakeId = null;

        this.IsParentDebt = false;

        this.CreateDateNumber = null;

        this.OrderId = null;
        this.OrderStatId = null;
        this.OrderGrandTotal = null;
        this.OrderCurrencyId = null;
        this.OrderIsReturn = null;
        this.RelatedOrderId = null;

        this.IsSeen = false;

        this.SentSeen = false;
        this.WaitingSeen = false;

        this.OrderStat = null;
    }

    NotificationId: number; // not null
    NotificationTypeId: NotificationTypes; // not null

    ParentRelationTypeId: RelationTypes; // null
    ChildRelationTypeId: RelationTypes; // null

    ParentPersonId: number; // not null
    ParentPersonTypeId: PersonTypes; // not null
    ParentPersonFullName: string; // not null

    ChildPersonId: number; // not null
    ChildPersonTypeId: PersonTypes; // not null
    ChildPersonFullName: string; // not null

    ApprovalStatId: ApprovalStats; // null

    FicheId: number; // null
    FicheTypeId: FicheTypes; // null
    FicheGrandTotal: number; // null
    FicheCurrencyId: Currencies; // null
    FicheTypeFakeId: FicheTypeFakes; // null

    IsParentDebt: boolean; // not null

    OrderId: number; // null
    OrderStatId: OrderStats; // null
    OrderGrandTotal: number; // null
    OrderCurrencyId: Currencies; // null
    OrderIsReturn: boolean; // null
    RelatedOrderId: number; // null

    CreateDateNumber: number; // not null

    IsSeen: boolean; // not null

    SentSeen: boolean; // Shadow property that shows if notification seen status sent to server.
    WaitingSeen: boolean; // Shadow property

    OrderStat: OrderStatListDto; // Shadow property
}