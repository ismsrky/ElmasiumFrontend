import { ProductUpdateTypes } from "../../enum/product/update-types.enum";

export class ProductUpdateDto {
    constructor() {
        this.ProductId = null;

        this.ProductUpdateTypeId = null;

        this.Name = null;
        this.OriginCountryId = null;
        this.Notes = null;
        this.CategoryId = null;
    }

    ProductId: number; // not null

    ProductUpdateTypeId: ProductUpdateTypes; // not null

    // One of following fields must be filled due 'ProductUpdateTypeId'. Other fields gets assumed as null.
    Name: string;
    OriginCountryId: number;
    Notes: string;
    CategoryId: number;
}