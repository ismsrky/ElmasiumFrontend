import { OrderDeliveryTimes } from "../../../enum/order/delivery-times.enum";
export class ShopOrderAreaSubDto {
    constructor() {
        this.Id = null;

        this.AddressCountryId = null;
        this.AddressStateId = null;
        this.AddressCityId = null;
        this.AddressDistrictId = null;
        this.AddressLocalityId = null;

        this.OrderDeliveryTimeId = null;

        this.OrderMinPrice = 0;
    }

    Id: number;

    AddressCountryId: number;
    AddressStateId: number;
    AddressCityId: number;
    AddressDistrictId: number;
    AddressLocalityId: number;

    OrderMinPrice: number;
    OrderDeliveryTimeId: OrderDeliveryTimes;

    copy(dto: ShopOrderAreaSubDto): void {
        this.Id = dto.Id;
        
        this.AddressCountryId = dto.AddressCountryId;
        this.AddressStateId = dto.AddressStateId;
        this.AddressCityId = dto.AddressCityId;
        this.AddressDistrictId = dto.AddressDistrictId;
        this.AddressLocalityId = dto.AddressLocalityId;

        this.OrderMinPrice = dto.OrderMinPrice;
        this.OrderDeliveryTimeId = dto.OrderDeliveryTimeId;
    }
}