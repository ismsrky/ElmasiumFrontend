import { Languages } from "../../enum/sys/languages.enum";
import { CommentTypes } from "../../enum/comment/types.enum";
import { CommentActionsDto } from "./actions.dto";
import { ProductTypes } from "../../enum/product/types.enum";

export class CommentListDto {
    constructor() {
        this.Id = null;

        this.CommentTypeId = null;
        this.IsAuthorSeller = null;
        this.AuthorPersonFullName = null;

        this.LanguageId = null;
        this.Comment = null;
        this.Star = 0;

        this.OrderId = null;
        this.ProductId = null;
        this.PersonId = null;
        this.OrderProductId = null;

        this.ProductName = null;
        this.PersonFullName = null;

        this.CreateDateNumber = null;
        this.UpdateDateNumber = null;

        this.LikeCount = 0;
        this.DislikeCount = 0;

        this.MyLike = null;

        this.RelatedCommentId = null;

        this.ActionsDto = null;
        this.GotActions = false;
        this.GotReplyComment = false;
    }

    Id: number; // not null

    CommentTypeId: CommentTypes; // not null
    IsAuthorSeller: boolean; // not null
    AuthorPersonFullName: string; // not null

    LanguageId: Languages; // not null
    Comment: string; // null
    Star: number; // not null

    OrderId: number; // not null
    ProductId: number; // null
    PersonId: number; // null
    OrderProductId: number; // null

    PersonFullName: string; // null

    ProductName: string; // null
    ProductTypeId: ProductTypes; //null

    CreateDateNumber: number; // not null
    UpdateDateNumber: number; // null

    LikeCount: number; // not null
    DislikeCount: number; // not null

    MyLike: boolean; // not null

    RelatedCommentId: number; // null

    ActionsDto: CommentActionsDto; // shadow propery
    GotActions: boolean; // shadow propery
    GotReplyComment: boolean; // shadow propery
}