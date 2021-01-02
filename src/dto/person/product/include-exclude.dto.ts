import { IncludeExcludeDto } from "../../include-exclude/include-exclude.dto";

export class PersonProductIncludeExcludeDto {
    constructor() {
        this.PersonProductId = null;

        this.IsInclude = false;

        this.IncludeExcludeList = null;
    }

    PersonProductId: number; // not null

    IsInclude: boolean; // not null

    IncludeExcludeList: IncludeExcludeDto[]; // null. 'Id' and 'PriceGap' are enough. null means delete all include/exclude of that person product has and it also mean there is no include/exclude of that person product.
}