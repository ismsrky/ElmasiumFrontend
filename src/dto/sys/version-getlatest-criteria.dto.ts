import { ApplicationTypes } from "../../enum/sys/app-types.enum";

export class SysVersionGetLatestCriteriaDto {
    constructor() {
        this.ApplicationTypeId = ApplicationTypes.Angular;
    }

    ApplicationTypeId: ApplicationTypes; // not null
}