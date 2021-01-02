import { ApplicationTypes } from "../../enum/sys/app-types.enum";
import { Languages } from "../../enum/sys/languages.enum";

export class HelpGetListCriteriaDto {
    constructor() {
        this.ApplicationTypeId = ApplicationTypes.Angular;
        this.Name = null;
    }

    ApplicationTypeId: ApplicationTypes; // not null
    Name: string; // not null
}