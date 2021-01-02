import { ProductCodeTypes } from "../../../enum/product/code-types.enum";

export class ProductCodeDto {
    constructor() {
        this.Code = null;
        this.ProductCodeTypeId = null;

        this.ProductId = null;
    }

    Code: string;
    ProductCodeTypeId: ProductCodeTypes;

    ProductId: number;
}