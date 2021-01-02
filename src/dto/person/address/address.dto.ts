import { AddressTypes } from '../../../enum/person/address-types.enum';
import { Stats } from '../../../enum/sys/stats.enum';

export class PersonAddressDto {
    constructor() {
        this.Id = null;
        this.AddressTypeId = null;
        this.PersonId = null;
        this.StatId = Stats.xActive;
        this.Name = null;
        this.InvolvedPersonName = null;

        this.CountryId = null;
        this.StateId = null;
        this.CityId = null;
        this.DistrictId = null;
        this.LocalityId = null;

        this.ZipCode = null;
        this.Notes = null;
        this.Phone = null;
    }
    
    Id: number;
    AddressTypeId: AddressTypes;
    PersonId: number;
    StatId: Stats;
    Name: string;
    InvolvedPersonName: string;

    CountryId: number;
    StateId: number;
    CityId: number;
    DistrictId: number;
    LocalityId: number;

    ZipCode: string;
    Notes: string;
    Phone: string;
}