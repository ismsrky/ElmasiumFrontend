export class OptionListDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.UrlName = null;

        this.PriceGap = 0;

        this.OptionList = null;

        this.IsChecked = false;
        this.SelectedOptionId = null;
    }

    Id: number; // not null
    Name: string; // not null
    UrlName: string; // not null

    PriceGap: number; // not null

    OptionList: OptionListDto[]; // null if case is 2 otherwise not null.

    IsChecked: boolean; // shadow property.
    SelectedOptionId: number; // shadow property.
}