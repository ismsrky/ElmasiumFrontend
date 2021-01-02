export class PropertyGetListCriteriaDto {
    constructor() {
        this.CaseId = 0;

        this.ProductCategoryId = null;
        this.PersonProductId = null;
        this.PropertyGroupId = null;
    }

    CaseId: number; // not null.  0: get list by category, 1: get list by person product, 2: get list by group.

    ProductCategoryId: number; // null
    PersonProductId: number; // null
    PropertyGroupId: number; // null
}