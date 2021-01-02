export class IncludeExcludeGetListCriteriaDto {
    constructor() {
        this.CaseId = 0;
        this.IsInclude = true;

        this.ProductCategoryId = null;
        this.Name = null;
        this.PageOffSet = 0;

        this.PersonProductId = null;
    }

    CaseId: number; // not null. 0: get list by category, 1: get list by person product
    IsInclude: boolean; // not null

    ProductCategoryId: number; // null
    Name: string; // null
    PageOffSet: number; // not null. Works only in case of 0.

    PersonProductId: number; // null
}