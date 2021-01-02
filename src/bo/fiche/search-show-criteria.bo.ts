import { FicheListDto } from "../../dto/fiche/list.dto";

// this class is used as a parameter class when showing 'PersonProductSearchIndexComp'.
export class FicheSearchShowCriteriaBo {
    constructor() {
        this.DebtPersonId = null;
        this.CreditPersonId = null;

        this.MyPersonId = null;

        this.ExcludingFicheIdList = null;

        this.Multiple = false;
        this.PreCheckedList = null;
    }

    DebtPersonId: number;
    CreditPersonId: number;

    MyPersonId: number;

    ExcludingFicheIdList: number[];

    Multiple: boolean;
    PreCheckedList: FicheListDto[]; // This param can be used only when 'Multiple' param set to true.
}