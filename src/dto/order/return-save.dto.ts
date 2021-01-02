export class OrderReturnSaveDto {
    constructor() {
        this.OrderId = null;
        this.Notes = null;
    }

    OrderId: number; // not null
    Notes: string; // not null. max length: 255
}