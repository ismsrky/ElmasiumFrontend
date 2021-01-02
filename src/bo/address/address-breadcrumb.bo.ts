export class AddressBreadcrumbBo {
    constructor() {
        this.CountryId = null;
        this.StateId = null;
        this.CityId = null;
        this.DistrictId = null;
        this.LocalityId = null;

        this.CountryName = null;
        this.StateName = null;
        this.CityName = null;
        this.DistrictName = null;
        this.LocalityName = null;
    }

    CountryId: number;
    StateId: number;
    CityId: number;
    DistrictId: number;
    LocalityId: number;

    CountryName: string;
    StateName: string;
    CityName: string;
    DistrictName: string;
    LocalityName: string;
}