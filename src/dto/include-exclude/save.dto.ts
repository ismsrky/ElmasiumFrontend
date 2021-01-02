export class IncludeExcludeSaveDto {
    constructor() {
        this.ProductCategoryId = null;
        this.IsInclude = null;

        this.IncludeExcludeNameListStr = null;
        this.IncludeExcludeName = null;
    }

    ProductCategoryId: number; // not null
    IsInclude: boolean; // not null

    // One of follow values must be given. Only admins can give a list.
    IncludeExcludeNameListStr: string; // null or not null
    IncludeExcludeName: string;  // null or not null
}