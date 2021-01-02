import { Stats } from "../../../enum/sys/stats.enum";
import { ShopTypes } from "../../../enum/person/shop-types.enum";

export class ShopListDto {
    constructor() {
    }

    Id: number;
    ShortName: string;
    ShopTypeId: ShopTypes;
    StatId: Stats;

    AddressInvolvedPersonName: string;
    AddressCityName: string;
    AddressDistrictName: string;
    AddressLocalityName: string;
    AddressQuarterName: string;
    AddressNotes: string;
    AddressPhone: string;
}