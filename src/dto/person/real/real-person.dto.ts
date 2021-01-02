import { Genders } from '../../../enum/person/genders.enum';
import { Currencies } from '../../../enum/person/currencies.enum';

export class RealPersonDto {
    constructor() {
        this.Name = null;
        this.Surname = null;
        this.Username = null;

        this.Phone = null;
        this.GenderId = null;
        this.DefaultCurrencyId = null;
        this.Birthdate = null;
        this.BirthdateNumber = null;
    }

    Name: string;
    Surname: string;
    Username: string;

    Phone: string;
    GenderId: Genders;
    DefaultCurrencyId: Currencies;
    Birthdate: Date;
    BirthdateNumber: number;
}