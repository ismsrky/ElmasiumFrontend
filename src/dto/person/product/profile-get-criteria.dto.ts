export class PersonProductProfileGetCriteriaDto {
    constructor() {
        this.CaseId = 0;

        this.PersonUrlName = null;
        this.ProductCode = null;

        this.PersonProductId = null;
    }

    CaseId: number; // 0: PersonUrlName and ProductCode mus be given, 1: PersonProductId must be given.

    PersonUrlName: string; // not null in case of 0. max length: 50
    ProductCode: string; // not null in case of 0. max length: 50

    PersonProductId: number; // not null in case of 1.
}