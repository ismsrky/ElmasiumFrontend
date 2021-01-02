export class BasketProductQuantityUpdateDto {
    constructor() {
        this.BasketProductId = null;
        this.Quantity = null;
    }

    BasketProductId: number; // not null
    Quantity: number; // not null
}