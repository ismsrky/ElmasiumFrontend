export class BasketProductIncludeExcludeUpdateDto {
    constructor() {
        this.BasketProductId = null;
        this.IncludeExcludeIdList = null;
    }

    BasketProductId: number; // not null
    IncludeExcludeIdList: number[]; // not null
}