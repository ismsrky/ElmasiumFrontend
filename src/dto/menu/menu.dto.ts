export class MenuDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.Url = null;
        this.IconClass = null;

        this.SubMenuList = null;

        this.Show = false;
        this.Active = false;
    }

    Id: number;
    Name: string;
    Url: string;
    IconClass: string;

    SubMenuList: MenuDto[];

    Show: boolean; // Shadow property
    Active: boolean; // Shadow property
}