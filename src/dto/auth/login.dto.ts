import { Languages } from "../../enum/sys/languages.enum";

export class LoginDto {
    constructor() {
        this.Username = null;
        this.Password = null;
        this.LanguageId = Languages.xTurkish;
    }

    Username: string;
    Password: string;
    LanguageId: Languages;
}