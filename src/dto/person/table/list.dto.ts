import { PersonTableStats } from "../../../enum/person/table-stats.enum";
import { TableFicheStats } from "../../../enum/table/fiche-stats.enum";
import { Currencies } from "../../../enum/person/currencies.enum";

export class PersonTableListDto {
    constructor() {
        this.Id = null;

        this.Name = null;
        this.PersonTableStatId = null;
        this.Order = 0;

        this.LastTableFicheId = null;
        this.TableFicheStatId = null;
        this.FicheCurrencyId = null;
        this.FicheDebtPersonId = null;
        this.FicheDebtPersonFullName = null;
        this.FicheGrandTotal = null;
        this.FicheCreateDateNumber = null;
    }

    Id: number; // not null

    Name: string; // not null
    PersonTableStatId: PersonTableStats; // not null
    Order: number; // not null

    LastTableFicheId: number; // null
    TableFicheStatId: TableFicheStats; // null
    FicheCurrencyId: Currencies; // null
    FicheDebtPersonId: number; // null
    FicheDebtPersonFullName: string; // null
    FicheGrandTotal: number; // null
    FicheCreateDateNumber: number; // null
}