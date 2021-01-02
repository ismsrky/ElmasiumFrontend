export class PropertySaveDto {
    constructor() {
        this.ProductCategoryId = null;

        this.Name = null;
        this.PropertyNameListStr = null;
    }

    ProductCategoryId: number; // not null

    Name: string;// not null. Group name.
    PropertyNameListStr: string; // not null
}