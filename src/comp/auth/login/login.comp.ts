import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

// Comp

// Service
import { AuthService } from '../../../service/auth/auth.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { ResponseGenDto } from '../../../dto/sys/response.dto';
import { LoginDto } from '../../../dto/auth/login.dto';
import { LoginReturnDto } from '../../../dto/auth/login-return.dto';
import { DictionaryDto } from '../../../dto/dictionary/dictionary.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { Stc, expandCollapse } from '../../../stc';
import { DialogService } from '../../../service/sys/dialog.service';
import { AppRouterService } from '../../../service/sys/router.service';
import { AppRoutes } from '../../../enum/sys/routes.enum';

@Component({
    selector: 'auth-login',
    templateUrl: './login.comp.html',
    animations: [expandCollapse]
})
export class AuthLoginComp implements OnInit, OnDestroy {
    @ViewChild('loginForm', { static: false }) loginForm: NgForm;

    isLangModalOpen: boolean = false;

    modalClosedSubs: Subscription;

    loginResult: ResponseGenDto<LoginReturnDto>;
    loginDto: LoginDto;

    busy: boolean = false;
    rememberMe: boolean = false;

    DicData: DictionaryDto[];
    logoutSubs: Subscription;

    showAbout: boolean = false;
    show: boolean = false;
    constructor(
        private authService: AuthService,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private appRouterService: AppRouterService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.loginDto = new LoginDto();

        this.show = !Stc.isRealLogin;
        if (Stc.isRealLogin) {

            setTimeout(() => {
                this.appRouterService.navigate(AppRoutes.homepage);
            });
        }
    }

    ngOnInit(): void {
        this.handleRememberMe();

        this.logoutSubs = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Logout).subscribe(
            message => {
                this.handleRememberMe();
                //this.registerDto = new RegisterPersonDto();
            });
        this.modalClosedSubs = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'LangSelect') {
                    this.isLangModalOpen = false;
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.logoutSubs);
        this.utils.unsubs(this.modalClosedSubs);
    }

    handleRememberMe(): void {
        const personRemember = this.localStorageService.realPersonRemember;
        if (this.utils.isNull(personRemember)) {
            this.rememberMe = false;
        } else {
            this.rememberMe = true;

            this.loginDto.Username = personRemember.Username;
        }
    }

    loginDirect(): void {
        this.busy = true;
        this.loginDto.LanguageId = this.localStorageService.LangId;

        let subs = this.authService.login(this.loginDto).subscribe(
            data => {
                this.utils.unsubs(subs);
                this.busy = false;

                this.loginResult = data;
                if (this.loginResult.IsSuccess) {
                    this.authService.loginHandle(data.Dto, this.loginDto.Username, this.rememberMe);

                    this.appRouterService.navigate(AppRoutes.homepage);
                } else {
                    this.dialogService.showError(this.loginResult.Message);
                }
            },
            err => {                
                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;
            }
        );
    }

    login(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loginDirect();
    }

    registerClick(): void {
        this.appRouterService.navigate(AppRoutes.register);
    }
    forgotPasswordClick(): void {
        this.appRouterService.navigate(AppRoutes.forgotPassword);
    }
}