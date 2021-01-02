import { NavMenuPositions } from "../../enum/person/nav-menu-position.enum";

export class PersonNavMenuDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.Url = null;
        this.IconClass = null;
        this.IconColor = null;

        this.Range = 0;

        this.Position = null;

        this.SubMenuList = null;

        this.Show = false;
        this.Active = false;
    }

    Id: number; // not null
    Name: string; // not null
    Url: string; // null
    IconClass: string; // null
    IconColor: string; // null

    Range: number; // not null

    Position: NavMenuPositions; // not null

    SubMenuList: PersonNavMenuDto[]; // null

    Show: boolean; // Shadow property
    Active: boolean; // Shadow property
}