import { PropertyListDto } from "../../property/list.dto";

export class ProductFilterListSummaryDto {
    constructor() {
        this.PropertyList = null;

        this.Count = 0;
        this.PageSize = 1;
    }

    PropertyList: PropertyListDto[]; // null

    Count: number; // not null
    PageSize: number; // not null. just an info, default value is 1 and cannot be less than 1.
}