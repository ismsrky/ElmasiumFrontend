import { ProductCodeTypes } from "../../../enum/product/code-types.enum";

export class ProductCodeListDto {
    constructor() {
        this.Id = null;

        this.Code = null;
        this.ProductCodeTypeId = null;

        this.CreateDateNumber = null;
        this.UpdateDateNumber = null;
    }

    Id: number;

    Code: string;
    ProductCodeTypeId: ProductCodeTypes;

    CreateDateNumber: number;
    UpdateDateNumber: number;
}