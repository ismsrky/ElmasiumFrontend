import { CommentTypes } from "../../enum/comment/types.enum";

export class ModalCommentSaveBo {
    constructor() {
        this.CommentId = null;

        this.OrderId = null;
        this.CommentTypeId = null;
        this.RelatedId = null;

        this.xCaption = null;

        this.IsAuthorSeller = false;

        this.ReplyCommentId = null;
    }

    CommentId: number;

    OrderId: number;
    CommentTypeId: CommentTypes;
    RelatedId: number;

    xCaption: string;

    IsAuthorSeller: boolean;

    ReplyCommentId: number;
}