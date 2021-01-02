import { OrderDeliveryTimes } from "../../../enum/order/delivery-times.enum";
import { Currencies } from "../../../enum/person/currencies.enum";
import { ShopOrderAreaSubDto } from "./order-area-sub.dto";
import { AddressBoundaries } from "../../../enum/person/address-boundaries.enum";
import { Stc } from "../../../stc";
import { OrderDeliveryTypes } from "../../../enum/order/delivery-types.enum";
import { UtilService } from "../../../service/sys/util.service";

export class ShopOrderAreaDto {
    constructor(private utils: UtilService) {
        this.PersonId = null;

        this.Id = null;

        this.AddressBoundaryId = null;
        this.AddressCountryId = null;
        this.AddressStateId = null;
        this.AddressCityId = null;
        this.AddressDistrictId = null;

        this.CurrencyId = null;
        this.OrderDeliveryTypeId = null;

        this.SubList = null;
    }

    PersonId: number;

    Id: number;

    AddressBoundaryId: AddressBoundaries;
    AddressCountryId: number;
    AddressStateId: number;
    AddressCityId: number;
    AddressDistrictId: number;

    CurrencyId: Currencies;
    OrderDeliveryTypeId: OrderDeliveryTypes;

    SubList: ShopOrderAreaSubDto[];

    copy(dto: ShopOrderAreaDto): void {
        this.PersonId = dto.PersonId;

        this.Id = dto.Id;

        this.AddressBoundaryId = dto.AddressBoundaryId;
        this.AddressCountryId = dto.AddressCountryId;
        this.AddressStateId = dto.AddressStateId;
        this.AddressCityId = dto.AddressCityId;
        this.AddressDistrictId = dto.AddressDistrictId;

        this.CurrencyId = dto.CurrencyId;
        this.OrderDeliveryTypeId = dto.OrderDeliveryTypeId;

        if (this.utils.isNull(dto.SubList)) {
            this.SubList = null;
        } else if (dto.SubList.length == 0) {
            this.SubList = [];
        } else {
            this.SubList = [];
            dto.SubList.forEach(element => {
                let newElement = new ShopOrderAreaSubDto();
                newElement.copy(element);

                this.SubList.push(newElement);
            });
        }
    }
}