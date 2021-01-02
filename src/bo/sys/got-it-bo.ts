import { GotItTypes } from "../../enum/sys/got-it-types.enum";

export class GotItBo {
    constructor() {
        this.PersonId = null;
        this.GotIt = false;
        this.GotItTypeId = null;
    }

    PersonId: number;
    GotIt: boolean;
    GotItTypeId: GotItTypes;
}