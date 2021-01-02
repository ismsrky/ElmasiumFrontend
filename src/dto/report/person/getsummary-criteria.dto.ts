import { Currencies } from "../../../enum/person/currencies.enum";

export class ReportPersonSummaryGetCriteriaDto {
    constructor() {
        this.IssueDateStartNumber = null;
        this.IssueDateEndNumber = null;

        this.CurrencyId = null;
    }

    IssueDateStartNumber: number;
    IssueDateEndNumber: number;

    CurrencyId: Currencies;
}