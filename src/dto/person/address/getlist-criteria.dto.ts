import { AddressTypes } from "../../../enum/person/address-types.enum";
import { Stats } from "../../../enum/sys/stats.enum";

export class PersonAddressGetListCriteriaDto {
    constructor() {
        this.OwnerPersonId = null;

        this.AddressTypeIdList = null;
        this.StatId = null;

        this.AddressIdList = null;
    }

    OwnerPersonId: number;

    AddressTypeIdList: AddressTypes[];
    StatId: Stats;

    AddressIdList: number[]; // null. Other params are ignored if any value presents.
}