import { ApplicationTypes } from "../../enum/sys/app-types.enum";

export class SysVersionDto {
    constructor() {
        this.Id = null;
        this.ApplicationTypeId = null;
        this.Version = null;
        this.ReleaseDateNumber = null;
        this.ReleaseNote = null;
    }

    Id: number; // not null
    ApplicationTypeId: ApplicationTypes; // not null
    Version: number; // not null
    ReleaseDateNumber: number; // null
    ReleaseNote: string; // not null. Lenght is max.
}