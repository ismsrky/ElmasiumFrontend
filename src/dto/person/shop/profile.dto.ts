import { ShopTypes } from "../../../enum/person/shop-types.enum";
import { AccountTypes } from "../../../enum/person/account-type.enum";
import { OrderDeliveryTimes } from "../../../enum/order/delivery-times.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class ShopProfileDto {
    constructor() {
        this.ShopId = null;
        this.UrlName = null;
        this.ShortName = null;

        this.ShopTypeName = null;
        this.ShopIsAvailable = false;
        this.ShopIsFoodBeverage = null;

        this.StarCount = 0;
        this.StarSum = 0;
        this.StarAverage = 0;

        this.TakesOrder = false;
        this.TakesOrderOutTime = false;

        this.OrderAccountList = null;
        this.OrderCurrencyList = null;

        this.PortraitImageUniqueIdStr = null;

        this.WorkingHoursTodayStr = null;
        this.HasWorkingHours = false;

        this.IsShopOwner = false;

        this.OrderMinPrice = null;
        this.OrderDeliveryTimeId = null;
        this.OrderCurrencyId = null;

        this.AddressId = null;
        this.AddressCountryName = null;
        this.AddressStateName = null;
        this.AddressCityName = null;
        this.AddressDistrictName = null;
        this.AddressLocalityName = null;
        this.AddressNotes = null;
        this.AddressZipCode = null;
        this.HasAddress = false;

        this.Phone = null;
        this.Phone2 = null;
        this.Email = null;
    }

    ShopId: number; // not null
    UrlName: string; // not null
    ShortName: string; // not null

    ShopTypeName: string; // not null
    ShopIsAvailable: boolean; // not null
    ShopIsFoodBeverage: boolean; // not null

    StarCount: number; // not null
    StarSum: number; // not null
    StarAverage: number; // Shadow property

    TakesOrder: boolean; // not null
    TakesOrderOutTime: boolean; // not null

    OrderAccountList: AccountTypes[];
    OrderCurrencyList: Currencies[];

    PortraitImageUniqueIdStr: string;

    WorkingHoursTodayStr: string;
    HasWorkingHours: boolean;

    IsShopOwner: boolean;

    OrderMinPrice: number; // null
    OrderDeliveryTimeId: OrderDeliveryTimes; // null
    OrderCurrencyId: Currencies; // null

    AddressId: number;
    AddressCountryName: string;
    AddressStateName: string;
    AddressCityName: string;
    AddressDistrictName: string;
    AddressLocalityName: string;
    AddressNotes: string;
    AddressZipCode: string;
    HasAddress: boolean;

    Phone: string;
    Phone2: string;
    Email: string;
}