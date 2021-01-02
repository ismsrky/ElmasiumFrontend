import { OrderStats } from "../../enum/order/stats.enum";

export class OrderStatListDto {
    constructor() {
        this.Id = null;

        this.Name = null;
        this.ActionName = null;

        this.IsEndPoint = false;
        this.IsRequireNotes = false;
        this.IsRequireAccountTypeId = false;

        this.ColorClassName = null;
        this.IconName = null;
        this.Order = 0;

        this.Checked = false;
    }

    Id: OrderStats; // not null

    Name: string; // not null
    ActionName: string; // not null

    IsEndPoint: boolean; // not null
    IsRequireNotes: boolean; // not null
    IsRequireAccountTypeId: boolean; // not null

    ColorClassName: string; // not null
    IconName: string; // not null
    Order: number; // not null

    Checked: boolean; // not null. Shadow property.

    copy(dto: OrderStatListDto): void {
        this.Id = dto.Id;

        this.Name = dto.Name;
        this.ActionName = dto.ActionName;

        this.IsEndPoint = dto.IsEndPoint;
        this.IsRequireNotes = dto.IsRequireNotes;

        this.ColorClassName = dto.ColorClassName;
        this.IconName = dto.IconName;
        this.Order = dto.Order;

        this.Checked = dto.Checked;
    }
}