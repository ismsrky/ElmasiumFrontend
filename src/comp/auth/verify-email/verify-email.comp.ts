import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Service
import { AuthService } from '../../../service/auth/auth.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto

// Enum
import { Languages } from '../../../enum/sys/languages.enum';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';

@Component({
    selector: 'verify-email',
    templateUrl: './verify-email.comp.html'
})
export class AuthVerifyEmailComp {
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    selectedLang: Languages;
    langList = Languages;

    busy: boolean = false;

    email: string = null;

    constructor(
        private authService: AuthService,
        private localStorageService: LocalStorageService,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private dialogService: DialogService) {
        this.selectedLang = localStorageService.LangId;
        this.email = this.localStorageService.realPerson.Username;
    }

    showModal(): void {
        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'AuthVerifyEmailComp');
            }
        );

        this.modal.show();
    }

    send(): void {
        this.busy = true;
        let subs = this.authService.sendVerifyEmail().subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.dialogService.show({
                        text: this.dicService.getValue('xVerificationMailSent'),
                        icon: DialogIcons.Warning,
                        buttons: DialogButtons.OK,
                        closeIconVisible: true
                    });

                    this.modal.hide();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'send', subs);
                this.busy = false;
            }
        );
    }
}