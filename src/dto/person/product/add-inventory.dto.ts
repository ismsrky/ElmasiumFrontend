export class PersonProductAddInventoryDto {
    constructor() {
        this.ProductId = null;
        this.PersonId = null;
    }

    ProductId: number; // not null
    PersonId: number; // not null. Can be real or shop.
}