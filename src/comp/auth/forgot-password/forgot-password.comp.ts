import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

// Comp

// Service
import { AuthService } from '../../../service/auth/auth.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { AppRouterService } from '../../../service/sys/router.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { AuthForgotPasswordDto } from '../../../dto/auth/forgot-password.dto';

// Enum
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { AppRoutes } from '../../../enum/sys/routes.enum';
import { Stc, expandCollapse } from '../../../stc';

@Component({
    selector: 'auth-forgot-pass',
    templateUrl: './forgot-password.comp.html',
    animations: [expandCollapse]
})
export class AuthForgotPassComp implements OnInit {
    forgotPasswordDto: AuthForgotPasswordDto;

    @ViewChild('forgetPasswordForm', { static: false }) forgetPasswordForm: NgForm;

    busy: boolean;

    show: boolean = false;
    constructor(
        private authService: AuthService,
        private localStorageService: LocalStorageService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private appRouterService: AppRouterService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.show = !Stc.isRealLogin;
        if (Stc.isRealLogin) {
            setTimeout(() => {
                this.appRouterService.navigate(AppRoutes.homepage);
            });
        }

        this.forgotPasswordDto = new AuthForgotPasswordDto();
    }

    ngOnInit(): void {
    }

    sendPassword(): void {
        if (this.forgetPasswordForm.invalid) {
            return;
        }

        this.forgotPasswordDto.LanguageId = this.localStorageService.LangId;

        this.busy = true;
        let subs = this.authService.sendForgotPassword(this.forgotPasswordDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.dialogService.show({
                        text: this.dicService.getValue('xForgetMailSent'),
                        icon: DialogIcons.Warning,
                        buttons: DialogButtons.OK,
                        closeIconVisible: true
                    });

                    // this.host.backToLogin();

                    this.appRouterService.navigatePrevUrl();
                    this.forgotPasswordDto = new AuthForgotPasswordDto();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'sendPassword', subs);
                this.busy = false;
            }
        );
    }
}