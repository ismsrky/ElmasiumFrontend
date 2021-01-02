import { Genders } from "../../../enum/person/genders.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class RealPersonBo {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.Surname = null;
        this.Username = null;
        this.LoginTime = null;
        this.TokenId = null;

        this.Phone = null;
        this.GenderId = null;
        this.DefaultCurrencyId = null;
        this.Birthdate = null;

        this.FullName = null;

        this.IsAnonymous = false;
    }

    Id: number;
    Name: string;
    Surname: string;
    Username: string;
    LoginTime: Date;
    TokenId: string;

    Phone: string;
    GenderId: Genders;
    DefaultCurrencyId: Currencies;
    Birthdate: Date;

    FullName: string;

    IsAnonymous: boolean; // Shadow property

    copy(): RealPersonBo {
        const result = new RealPersonBo();

        result.Id = this.Id;
        result.Name = this.Name;
        result.Surname = this.Surname;
        result.Username = this.Username;
        result.LoginTime = this.LoginTime;
        result.TokenId = this.TokenId;

        result.Phone = this.Phone;
        result.GenderId = this.GenderId;
        result.DefaultCurrencyId = this.DefaultCurrencyId;
        result.Birthdate = this.Birthdate;

        result.IsAnonymous = this.IsAnonymous;

        return result;
    }
}