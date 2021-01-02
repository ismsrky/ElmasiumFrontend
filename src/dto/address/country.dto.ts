export class AddressCountryDto {
    constructor() {
        this.Id = null;
        this.Name = null;
        this.HasStates = false;
    }

    Id: number;
    Name: string;
    HasStates: boolean;
}