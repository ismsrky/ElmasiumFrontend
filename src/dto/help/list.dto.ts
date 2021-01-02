import { SafeUrl } from "@angular/platform-browser";

export class HelpListDto {
    constructor() {
        this.CreateDateNumber = null;
        this.UpdateDateNumber = null;

        this.VideoUrl = null;
        this.ImageUrl = null;
        this.IsTextHtml = false;
        this.Caption = null;
        this.Text = null;

        this.Order = 0;

        this.SafeVideoUrl = null;
    }

    CreateDateNumber: number; // not null
    UpdateDateNumber: number; // null

    VideoUrl: string; // null
    ImageUrl: string; // null
    IsTextHtml: boolean; // not null
    Caption: string; // not null
    Text: string; // null

    Order: number; // not null

    SafeVideoUrl: SafeUrl; // shadow property
}