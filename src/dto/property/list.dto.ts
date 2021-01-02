export class PropertyListDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.UrlName = null;
        this.Count = 0;

        this.PropertyList = null;

        this.IsExpanded = false;
        this.IsChecked = false;
    }

    Id: number; // not null
    Name: string; // not null
    UrlName: string; // not null
    Count: number; // not null

    PropertyList: PropertyListDto[]; // null if case is 2 otherwise not null.

    IsExpanded: boolean; // shadow property.
    IsChecked: boolean; // shadow property.
}