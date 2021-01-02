import { PersonTypes } from "../../../enum/person/person-types.enum";
import { FicheTypes } from "../../../enum/fiche/types.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

import { FicheTypeFakes } from "../../../enum/fiche/type-fakes.enum";
import { ApprovalStats } from "../../../enum/approval/stats.enum";

export class ApprovalFicheListDto {
    constructor() {
        this.ApprovalFicheId = null;

        this.DebtPersonId = null;
        this.DebtPersonTypeId = null;
        this.DebtPersonFullName = null;

        this.CreditPersonId = null;
        this.CreditPersonTypeId = null;
        this.CreditPersonFullName = null;

        this.FicheId = null;
        this.FicheTypeId = null;
        this.FicheGrandTotal = 0;
        this.FicheCurrencyId = null;
        this.FicheApprovalStatId = null;

        this.FicheTypeFakeId = null;

        this.HasRelation = false;

        this.CreateDateNumber = null;
    }

    ApprovalFicheId: number;

    DebtPersonId: number;
    DebtPersonTypeId: PersonTypes;
    DebtPersonFullName: string;

    CreditPersonId: number;
    CreditPersonTypeId: PersonTypes;
    CreditPersonFullName: string;

    FicheId: number;
    FicheTypeId: FicheTypes;
    FicheGrandTotal: number;
    FicheCurrencyId: Currencies;
    FicheApprovalStatId: ApprovalStats;

    FicheTypeFakeId: FicheTypeFakes;

    HasRelation: boolean;

    CreateDateNumber: number;
}