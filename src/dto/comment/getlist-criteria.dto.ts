import { CommentTypes } from "../../enum/comment/types.enum";
import { CommentSortTypes } from "../../enum/comment/sort-types.enum";

export class CommentGetListCriteriaDto {
    constructor() {
        this.CaseId = null;

        this.CommentTypeId = null;
        this.CommentSortTypeId = null;

        this.ProductId = null;
        this.PersonId = null;

        this.CommentId = null;

        this.PageOffSet = 0;
    }

    CaseId: number; // not null

    CommentTypeId: CommentTypes; // null
    CommentSortTypeId: CommentSortTypes; // not null

    ProductId: number; // null
    PersonId: number; // null

    CommentId: number; // null

    PageOffSet: number; // not null
}

/**
 * Case 0: Get all comments about that product of that shop.
 * Case 1: Get all comments about that shop.
 * Case 2: Get all comments that author is me.
 * Case 3: Get all comments about every product of that shop.
 * Case 4: Only one comment is requested.
 */