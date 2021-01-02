import { FicheContents } from "../../enum/fiche/contents.enum";
import { FicheContentGroups } from "../../enum/fiche/content-groups.enum";

export class FicheContentGroupBo {
    ContentGroupId: FicheContentGroups;

    ContentList: FicheContents[];
}