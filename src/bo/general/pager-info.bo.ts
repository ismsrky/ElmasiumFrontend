export class PagerInfoBo {
    constructor() {
    }

    TotalItemsCount: number; // not null
    CurrentPage: number; // not null
    PageSize: number;
    TotalPages: number;
    StartPage: number;
    EndPage: number;
    StartIndex: number;
    EndIndex: number;

    Pages: number[];
}