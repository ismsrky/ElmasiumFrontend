import { AccountTypes } from "../../../enum/person/account-type.enum";
import { PersonAccountListDto } from "../../../dto/person/account/list.dto";

export class PersonAccountCmbBo {
    accountTypeId: AccountTypes;

    accountList: PersonAccountListDto[];
}