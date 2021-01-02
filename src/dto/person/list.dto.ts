import { Stats } from "../../enum/sys/stats.enum";
import { PersonTypes } from "../../enum/person/person-types.enum";
import { Currencies } from "../../enum/person/currencies.enum";
import { ShopTypes } from "../../enum/person/shop-types.enum";
import { PersonAddressListDto } from "./address/address-list.dto";
import { RelationTypes } from "../../enum/person/relation-types.enum";
import { BalanceStats } from "../../enum/person/balance-stats.enum";

export class PersonListDto {
    constructor() {
        this.Id = null;

        this.FullName = null;
        this.StatId = null;
        this.PersonTypeId = null;

        this.DefaultCurrencyId = null;
        this.ShopTypeId = null;

        this.MasterRelationTypeId = null;

        this.Address = null;

        this.Balance = 0;
        this.BalanceStatId = null;

        this.UrlName = null;

        this.IsActivitiesOpen = false;
    }

    Id: number;

    FullName: string;
    StatId: Stats;
    PersonTypeId: PersonTypes;

    DefaultCurrencyId: Currencies;
    ShopTypeId: ShopTypes;

    MasterRelationTypeId: RelationTypes;

    Address: PersonAddressListDto;

    Balance: number;
    BalanceStatId: BalanceStats;

    UrlName: string;

    IsActivitiesOpen: boolean; // Shadow property
}