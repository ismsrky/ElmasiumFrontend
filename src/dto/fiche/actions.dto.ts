export class FicheActionsDto {
    constructor() {
        this.Deletable = false;
        this.Acceptable = false;
        this.Rejectable = false;
        this.PullBackable = false;

        this.Commentable = false;
    }

    Deletable: boolean;
    Acceptable: boolean;
    Rejectable: boolean;
    PullBackable: boolean;

    Commentable: boolean;
}