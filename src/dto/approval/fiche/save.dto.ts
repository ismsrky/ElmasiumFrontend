import { ApprovalStats } from "../../../enum/approval/stats.enum";
import { FicheMoneyDto } from "../../fiche/money/money.dto";

export class ApprovalFicheSaveDto {
    constructor() {
        this.FicheId = null;
        this.ApprovalStatId = null;

        this.ChoiceReturnList = null;
    }

    FicheId: number;
    ApprovalStatId: ApprovalStats;

    ChoiceReturnList: FicheMoneyDto[];
}