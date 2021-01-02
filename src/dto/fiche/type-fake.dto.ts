import { FicheTypeFakes } from "../../enum/fiche/type-fakes.enum";
import { FicheTypes } from "../../enum/fiche/types.enum";

export class FicheTypeFakeDto {
    constructor() {
        this.Id = null;
        this.Name = null;

        this.FicheTypeId = null;
        this.FicheTypeName = null;
    }

    Id: FicheTypeFakes;
    Name: string;

    FicheTypeId: FicheTypes;
    FicheTypeName: string;
}