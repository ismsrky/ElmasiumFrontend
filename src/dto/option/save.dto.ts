export class OptionSaveDto {
    constructor() {
        this.ProductCategoryId = null;

        this.Name = null;
        this.OptionNameListStr = null;
    }

    ProductCategoryId: number; // not null

    Name: string;// not null. Group name.
    OptionNameListStr: string; // not null
}