import { OrderDeliveryTimes } from "../../../enum/order/delivery-times.enum";

export class ShopOrderAreaSubListDto {
    constructor() {
        this.Id = null;

        this.AddressName = null;

        this.OrderMinPrice = 0;
        this.OrderDeliveryTimeId = null;

        this.HasStates = false;
    }

    Id: number;

    AddressName: string;

    OrderMinPrice: number;
    OrderDeliveryTimeId: OrderDeliveryTimes;

    HasStates: boolean;
}