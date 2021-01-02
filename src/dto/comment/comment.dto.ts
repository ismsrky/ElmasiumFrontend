import { CommentTypes } from "../../enum/comment/types.enum";

export class CommentDto {
    constructor() {
        this.Id = null;
        this.OrderId = null;

        this.CommentTypeId = null;
        this.OrderProductId = null;
        this.PersonId = null;

        this.Comment = null;
        this.Star = 0;
    }

    Id: number; // null
    OrderId: number; // not null.

    CommentTypeId: CommentTypes; // not null
    OrderProductId: number; // null
    PersonId: number; // null

    Comment: string; // null. Max lenght: 1000
    Star: number; // not null. Min: 1, Max:5

    RelatedCommentId: number; // null
}