import { Currencies } from "../../enum/person/currencies.enum";
import { Genders } from "../../enum/person/genders.enum";

export class LoginReturnDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.Surname = null;
        this.TokenId = null;
        this.GenderId = null;
        this.DefaultCurrencyId = null;
    }

    Id: number;
    Name: string;
    Surname: string;
    TokenId: string;
    GenderId: Genders;
    DefaultCurrencyId: Currencies;
}