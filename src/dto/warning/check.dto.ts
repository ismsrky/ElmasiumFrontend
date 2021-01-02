import { WarningModuleTypes } from "../../enum/warning/module-types.enum";

export class WarningCheckDto {
    constructor() {
        this.WarningModuleTypeId = null;

        this.PersonProductId = null;
        this.CommentId = null;
        this.PersonId = null;
    }

    WarningModuleTypeId: WarningModuleTypes; // not null 

    PersonProductId: number; // null
    CommentId: number; // null 
    PersonId: number; // null
}