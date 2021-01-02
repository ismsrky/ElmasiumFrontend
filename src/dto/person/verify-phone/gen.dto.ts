export class PersonVerifyPhoneGenDto {
    constructor() {
        this.PersonId = null;
        this.Phone = null;
    }

    PersonId: number; // not null
    Phone: string; // not null
}