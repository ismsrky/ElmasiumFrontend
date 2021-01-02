import { PosProductShortCutListDto } from "./product-shortcut-list.dto";

export class PosProductShortCutGroupListDto {
    constructor() {
        this.Id = null;
        this.Name = null;

        this.ProductList = null;

        this.Selected = false;
    }

    Id: number;
    Name: string;
    ProductList: PosProductShortCutListDto[];

    Selected: boolean; // Shadow property
}