export class LogExceptionBo {
    constructor() {
        this.Class = null;
        this.Method = null;

        this.Message = null;
        this.Stack = null;
        this.Source = null;

        this.InnerCreateDateNumber = Date.now();
        
        this.IsSent = false;
    }

    Class: string;
    Method: string;

    Message: string;
    Stack: string;
    Source: string;

    InnerCreateDateNumber: number;

    IsSent: boolean;
}