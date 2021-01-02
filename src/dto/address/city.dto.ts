export class AddressCityDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.Plate = null;

        this.StatedId = null;
        this.CountryId = null;
    }

    Id: number;
    Name: string;
    Plate: number;

    StatedId: number; // can be null
    CountryId: number;
}