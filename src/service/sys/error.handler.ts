import { ErrorHandler, Injectable } from "@angular/core";
import { LogExceptionService } from "../log/exception.service";

@Injectable()
export class SysErrorHandler implements ErrorHandler {

    constructor(
        private logExService: LogExceptionService
    ) {
    }

    handleError(error) {
        this.logExService.saveEx(error, null, null);
    }
}