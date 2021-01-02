export class PersonVerifyPhoneSaveDto {
    constructor() {
        this.Id = null;
        this.VerifyCode = null;
    }

    Id: number; // not null
    VerifyCode: string; // not null
}