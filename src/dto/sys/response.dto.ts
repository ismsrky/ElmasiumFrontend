
// Generic type of 'ResponseDto' class.
// Both classes are same at server-side.
export class ResponseGenDto<T> {
    constructor() {
        this.IsSuccess = false;
        this.HasException = false;
        this.Message = null;
        this.ReturnedId = null;
        this.Dto = name;
    }

    IsSuccess: boolean; // not null
    HasException: boolean; // not null
    Message: string; // null
    ReturnedId: number; // null
    Dto: T;
}


export class ResponseDto {
    constructor() {
        this.IsSuccess = false;
        this.HasException = false;
        this.Message = null;

        this.ReturnedId = null;
    }

    IsSuccess: boolean; // not null
    HasException: boolean; // not null
    Message: string; // null

    ReturnedId: number;
}