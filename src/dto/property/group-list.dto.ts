export class PropertyGroupListDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.UrlName = null;
        this.CanFilter = false;
    }

    Id: number; // not null
    Name: string; // not null
    UrlName: string; // not null
    CanFilter: boolean; // not null
}