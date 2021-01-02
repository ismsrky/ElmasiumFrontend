export class PersonVerifyPhoneGenReturnDto {
    constructor() {
        this.StartDateTimeNumber = null;
        this.EndDateTimeNumber = null;
        this.CountDownInSeconds = 90;
    }

    StartDateTimeNumber: number; // not null
    EndDateTimeNumber: number; // not null
    CountDownInSeconds: number; // not null
}