import { ProductTypes } from "../../enum/product/types.enum";

export class ModalProductNewBo {
    constructor() {
        this.PersonId = null;

        this.ProductTypeId = null;

        this.Name = null;
        this.Barcode = null;

        this.IsFoodBeverage = null;
    }

    PersonId: number; // not null

    ProductTypeId: ProductTypes; // null

    Name: string; // null
    Barcode: string; // null

    IsFoodBeverage: boolean; // not null
}