import { Genders } from "../../enum/person/genders.enum";
import { ShopTypes } from "../../enum/person/shop-types.enum";

export class RegisterPersonDto {
    constructor() {
        this.Username = null;
        this.Password = null;
        this.RePassword = null;
        this.Name = null;
        this.Surname = null;
        this.LanguageId = null;
        this.Birthdate = null;
        this.BirthdateNumber = null;

        this.GenderId = null;

        this.HaveShopToo = false;
        this.ShopShortName = null;
        this.ShopTypeId = null;
    }

    Username: string;
    Password: string;
    RePassword: string;
    Name: string;
    Surname: string;
    LanguageId: number;
    Birthdate: Date;
    BirthdateNumber: number;

    GenderId: Genders;

    HaveShopToo: boolean;
    ShopShortName: string;
    ShopTypeId: ShopTypes;
}