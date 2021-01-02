export class CommentActionsDto {
    constructor() {
        this.Deletable = false;
        this.Editable = false;
        this.Replyable = false;
    }

    Deletable: boolean;
    Editable: boolean;
    Replyable: boolean;
}