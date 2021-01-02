import { FicheRelationTypes } from "../../../enum/fiche/relation-types.enum";

export class FicheRelationSaveDto {
    constructor() {
        this.ChildFicheId = null;
        this.FicheRelationTypeId = null;
    }

    ChildFicheId: number;
    FicheRelationTypeId: FicheRelationTypes;
}