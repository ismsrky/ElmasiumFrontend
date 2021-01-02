import { BalanceStats } from "../../../enum/person/balance-stats.enum";

export class ReportPersonSummaryDto {
    constructor() {
        this.SaleGrandTotal = 0;
        this.SaleCostTotal = 0;

        this.CreditTotal = 0;
        this.DebtTotal = 0;
        this.Balance = 0;
        this.BalanceStatId = null;

        this.RevenueCashTotal = 0;
        this.RevenueBankTotal = 0;
        this.ChargeSaleTotal = 0;

        this.PersonAccountCashTotal = 0;
        this.PersonAccountBankTotal = 0;
        this.PersonAccountCreditCardTotal = 0;
    }

    SaleGrandTotal: number;
    SaleCostTotal: number;

    CreditTotal: number;
    DebtTotal: number;
    Balance: number; // Shadow property
    BalanceStatId: BalanceStats; // Shadow property

    RevenueCashTotal: number;
    RevenueBankTotal: number;
    ChargeSaleTotal: number;

    PersonAccountCashTotal: number;
    PersonAccountBankTotal: number;
    PersonAccountCreditCardTotal: number;
}