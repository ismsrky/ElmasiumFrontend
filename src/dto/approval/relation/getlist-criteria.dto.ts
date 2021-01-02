export class ApprovalRelationGetListCriteriaDto {
    constructor() {
        this.MyPersonId = null;
        this.GetIncomings = true;
    }

    MyPersonId: number;
    GetIncomings: boolean;
}