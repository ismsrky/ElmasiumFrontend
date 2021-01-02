export class OrderSaveDto {
    constructor() {
        this.BasketId = null;

        this.DeliveryAddressId = null;

        this.Notes = null;
    }

    BasketId: number; // not null

    DeliveryAddressId: number; // not null

    Notes: string; // null. max length: 255
}