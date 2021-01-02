import { ShopTypes } from "../../../enum/person/shop-types.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class RegisterShopDto {
    constructor() {
        this.ShortName = null;
        this.ShopTypeId = null;
        this.DefaultCurrencyId = null;
    }

    ShortName: string;
    ShopTypeId: ShopTypes;
    DefaultCurrencyId: Currencies;
}