import { ApplicationTypes } from "../../enum/sys/app-types.enum";

export class LogExceptionDto {
    constructor() {
        this.ApplicationTypeId = ApplicationTypes.Angular;

        this.Class = null;
        this.Method = null;

        this.Message = null;
        this.Stack = null;
        this.Source = null;

        this.InnerCreateDateNumber = Date.now();
    }

    ApplicationTypeId: ApplicationTypes;

    Class: string;
    Method: string;

    Message: string;
    Stack: string;
    Source: string;

    InnerCreateDateNumber: number;
}