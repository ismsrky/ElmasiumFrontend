export class DashboardSliderGroupListDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.Order = 0;
    }

    Id: number; // not null
    Name: string; // not null
    Order: number; // not null
}