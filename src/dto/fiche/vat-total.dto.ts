export class FicheVatTotalDto {
    constructor() {
        this.Id = null;
        this.FicheId = null;

        this.VatRate = 0;
        this.VatTotal = 0;
    }

    Id: number;
    FicheId: number;

    VatRate: number;
    VatTotal: number;
}