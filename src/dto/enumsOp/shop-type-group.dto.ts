import { ShopTypeDto } from "./shop-type.dto";

export class ShopTypeGroupDto {
    constructor() {
    }

    Id: number;
    Name: string;

    TypeList: ShopTypeDto[];
}