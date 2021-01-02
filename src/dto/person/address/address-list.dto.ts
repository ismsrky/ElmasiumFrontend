import { AddressTypes } from "../../../enum/person/address-types.enum";
import { Stats } from "../../../enum/sys/stats.enum";

export class PersonAddressListDto {
    constructor() {
        this.Id = null;
        this.AddressTypeId = null;
        this.StatId = null;
        this.Name = null;
        this.InvolvedPersonName = null;

        this.CountryName = null;
        this.StateName = null;
        this.CityName = null;
        this.DistrictName = null;
        this.LocalityName = null;

        this.ZipCode = null;
        this.Notes = null;
        this.Phone = null;

        this.IsCrudOpen = false;
        this.IsSelect = false;
    }

    Id: number;
    AddressTypeId: AddressTypes;
    StatId: Stats;
    Name: string;
    InvolvedPersonName: string;

    CountryName: string;
    StateName: string;
    CityName: string;
    DistrictName: string;
    LocalityName: string;

    ZipCode: string;
    Notes: string;
    Phone: string;

    IsCrudOpen: boolean; // Shadow property
    IsSelect: boolean; // Shadow property
}