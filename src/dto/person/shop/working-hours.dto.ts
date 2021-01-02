export class ShopWorkingHoursDto {
    constructor() {
        this.PersonId = null;

        this.MonStartEnd = '-1';
        this.TuesStartEnd = '-1';
        this.WedStartEnd = '-1';
        this.ThursStartEnd = '-1';
        this.FriStartEnd = '-1';
        this.SatStartEnd = '-1';
        this.SunStartEnd = '-1';

        this.TakesOrderOutTime = null;
    }

    PersonId: number; // not null

    MonStartEnd: string; // not null
    TuesStartEnd: string; // not null
    WedStartEnd: string; // not null
    ThursStartEnd: string; // not null
    FriStartEnd: string; // not null
    SatStartEnd: string; // not null
    SunStartEnd: string; // not null

    TakesOrderOutTime: boolean; // not null
}