import { OptionDto } from "../../option/option.dto";

export class PersonProductOptionDto {
    constructor() {
        this.PersonProductId = null;
        this.OptionList = null;
    }

    PersonProductId: number; // not null
    OptionList: OptionDto[]; // null. null means delete all option of that person product and it also mean there is no option of that person product.
}