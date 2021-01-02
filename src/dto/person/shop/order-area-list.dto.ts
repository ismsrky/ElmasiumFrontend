import { Currencies } from "../../../enum/person/currencies.enum";
import { ShopOrderAreaSubListDto } from "./order-area-sub-list.dto";
import { AddressBoundaries } from "../../../enum/person/address-boundaries.enum";
import { OrderDeliveryTypes } from "../../../enum/order/delivery-types.enum";

export class ShopOrderAreaListDto {
    constructor() {
        this.Id = null;

        this.AddressBoundaryId = null;
        this.AddressName = null;

        this.CurrencyId = null;
        this.OrderDeliveryTypeId = null;

        this.SubList = null;
    }

    Id: number;

    AddressBoundaryId: AddressBoundaries;
    AddressName: string;

    CurrencyId: Currencies;
    OrderDeliveryTypeId: OrderDeliveryTypes;

    SubList: ShopOrderAreaSubListDto[];
}