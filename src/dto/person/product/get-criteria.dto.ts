import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonProductGetCriteriaDto {
    constructor() {
        this.PersonProductId = null;

        this.ProductId = null;
        this.ProductCode = null;

        this.PersonId = null;

        this.CurrencyId = null;
    }

    PersonProductId: number; // null. 'ProductId' and 'ProductCode' are ignored if any value represented.

    // One of followings must be filled if 'PersonProductId' is null.
    ProductId: number; // null
    ProductCode: string; // null

    PersonId: number; // not null. Can be real or shop.

    CurrencyId: Currencies; // not null
}

/**
 * Notes
 *
 * CurrencyId:
 * CurrencyId cannot be null.
 * The service first look if there is a price in given currency and shop.
 * If not found, then it will look in pool in given currency.
 * If not found, then it will convert price to desired currency.
 */