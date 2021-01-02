export class OptionGroupListDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.UrlName = null;
    }

    Id: number; // not null
    Name: string; // not null
    UrlName: string; // not null
}