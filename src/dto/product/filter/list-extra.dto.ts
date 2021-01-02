import { ProductCodeDto } from "../code/code.dto";

export class ProductFilterListExtraDto {
    constructor() {
        this.PersonProductId = null;

        this.PortraitImageUniqueIdStr = null;
    }

    PersonProductId: number; // not null

    PortraitImageUniqueIdStr: string; // null
}