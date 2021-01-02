export class ModalBasketAddBo {
    constructor() {
        this.ShopId = null;
        this.ProductId = null;

        this.PersonProductId = null;

        this.Quantity = 1;

        this.IsFastSale = false;
    }

    ShopId: number; // not null
    ProductId: number; // not null
    PersonProductId: number; // not null

    Quantity: number; // not null

    IsFastSale: boolean; // not null. true means 'buy now' otherwise just add to the basket.
}