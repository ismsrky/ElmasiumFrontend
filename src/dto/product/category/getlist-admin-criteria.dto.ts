export class ProductCategoryGetListAdminCriteriaDto {
    constructor() {
        this.ParentId = null;
    }

    ParentId: number; // null. value 0 means root.
}