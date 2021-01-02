import { ProductUpdateTypes } from "../../enum/product/update-types.enum";

export  class ProductUpdateCheckDto {
    constructor() {
        this.ProductId = null;

        this.ProductUpdateTypeId = null;
    }

    ProductId: number; // not null

    ProductUpdateTypeId: ProductUpdateTypes; // not null
}