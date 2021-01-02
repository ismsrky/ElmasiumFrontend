export class DashboardSliderListDto {
    constructor() {
        this.Id = null;
        this.Order = 0;

        this.xText = null;
        this.xTextBold = null;
        this.xButtonText = null;

        this.ColorClass = null;

        this.PortraitImageUniqueIdStr = null;

        this.GroupId = null;
    }

    Id: number; // not null
    Order: number; // not null

    xText: string; // not null
    xTextBold: string; // not null
    xButtonText: string; // not null

    ColorClass: string; // not null

    PortraitImageUniqueIdStr: string; // not null

    GroupId: number; // not null
}