import { Languages } from "../../enum/sys/languages.enum";

export class AuthForgotPasswordDto {
    constructor() {
        this.Email = null;
        this.LanguageId = Languages.xTurkish;
    }

    Email: string;
    LanguageId: Languages;
}