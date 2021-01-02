export class IncludeExcludeDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.PriceGap = 0;

        this.IsInclude = null;

        this.IsFocused = false;
        this.IsSelected = false;
    }

    Id: number; // not null
    Name: string; // null
    PriceGap: number; // not null

    IsInclude: boolean; // not null

    IsFocused: boolean; // Shadow property
    IsSelected: boolean; // Shadow property
}