import { WarningTypes } from "../../enum/warning/types.enum";
import { WarningModuleTypes } from "../../enum/warning/module-types.enum";

export class WarningDto {
    constructor() {
        this.Id = null;
        this.WarningModuleTypeId = null;

        this.PersonProductId = null;
        this.CommentId = null;
        this.PersonId = null;

        this.WarningTypeId = null;
        this.Notes = null;
    }

    Id: number; // null 
    WarningModuleTypeId: WarningModuleTypes; // not null 

    PersonProductId: number; // null
    CommentId: number; // null 
    PersonId: number; // null

    WarningTypeId: WarningTypes; // not null 
    Notes: string; // null 
}