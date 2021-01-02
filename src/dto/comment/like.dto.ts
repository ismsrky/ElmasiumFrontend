export class CommentLikeDto {
    constructor() {
        this.CommentId = null;
        this.IsLike = true;
    }

    CommentId: number;
    IsLike: boolean;
}