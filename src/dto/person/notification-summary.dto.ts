export class PersonNotificationSummaryDto {
    constructor() {
        this.PersonId = null;

        this.xFicheIncomings = null;
        this.xFicheOutgoings = null;

        this.xRelationIncomings = null;
        this.xRelationOutgoings = null;

        this.xNotifications = null;

        this.xIncomingOrders = null;
        this.xOutgoingOrders = null;

        this.xIncomingOrderReturns = null;
        this.xOutgoingOrderReturns = null;

        this.xBasket = null;

        this.TotalIncomings = 0;
        this.TotalOutgoing = 0;
    }

    PersonId: number; // not null

    xFicheIncomings: number; // not null
    xFicheOutgoings: number; // not null

    xRelationIncomings: number; // not null
    xRelationOutgoings: number; // not null

    xNotifications: number; // not null

    xIncomingOrders: number; // not null
    xOutgoingOrders: number; // not null

    xIncomingOrderReturns: number; // not null
    xOutgoingOrderReturns: number; // not null

    xBasket: number; // not null

    TotalIncomings: number; // Shadow property
    TotalOutgoing: number; // Shadow property
}