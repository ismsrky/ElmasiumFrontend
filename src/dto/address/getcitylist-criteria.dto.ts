export class AddressGetCityListCriteriaDto {
    constructor() {
        this.CountryId = null;
        this.StateId = null;
    }

    CountryId: number;
    StateId: number; // can be null
}