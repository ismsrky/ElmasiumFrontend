import { PersonTypes } from "../../../enum/person/person-types.enum";
import { Stats } from "../../../enum/sys/stats.enum";
import { Currencies } from "../../../enum/person/currencies.enum";
import { RelationTypes } from "../../../enum/person/relation-types.enum";

export class AlonePersonDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.Surname = null;
        this.Email = null;

        this.PersonTypeId = null;

        this.StatId = null;
        this.DefaultCurrencyId = null;

        this.Phone = null;
        this.Notes = null;

        this.ParentRelationPersonId = null;
        this.ChildRelationTypeId = null;

        this.PersonAddressId = null;
        this.AddressCountryId = null;
        this.AddressStateId = null;
        this.AddressCityId = null;
        this.AddressDistrictId = null;
        this.AddressNotes = null;

        this.TaxOffice = null;
        this.TaxNumber = null;

        this.IsCrudOpen = false;
    }

    Id: number;
    Name: string;
    Surname: string;
    Email: string;

    PersonTypeId: PersonTypes;

    StatId: Stats;
    DefaultCurrencyId: Currencies;

    Phone: string;
    Notes: string;

    ParentRelationPersonId: number;
    ChildRelationTypeId: RelationTypes;

    // Address
    PersonAddressId: number;
    AddressCountryId: number;
    AddressStateId: number;
    AddressCityId: number;
    AddressDistrictId: number;
    AddressNotes: string;

    TaxOffice: string;
    TaxNumber: string;

    IsCrudOpen: boolean; // Shadow property
}