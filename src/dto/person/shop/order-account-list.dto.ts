import { AccountTypes } from "../../../enum/person/account-type.enum";

export class ShopOrderAccountListDto {
    constructor() {
        this.Id = null;
        this.AccountTypeId = null;
    }

    Id: number; // not null
    AccountTypeId: AccountTypes; // not null
}