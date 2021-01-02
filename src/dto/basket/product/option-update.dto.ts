export class BasketProductOptionUpdateDto {
    constructor() {
        this.BasketProductId = null;
        this.OptionIdList = null;
    }

    BasketProductId: number; // not null
    OptionIdList: number[]; // not null
}