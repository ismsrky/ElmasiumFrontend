export class PersonAddressGetCriteriaDto {
    constructor() {
        this.AddressId = null;
    }

    AddressId: number; // not null. -1 means get the xArea address.
}