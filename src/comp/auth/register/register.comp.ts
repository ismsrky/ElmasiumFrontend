import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { AuthService } from '../../../service/auth/auth.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { EnumsOpService } from '../../../service/enumsop/enumsop.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { RegisterPersonDto } from '../../../dto/auth/register-person.dto';
import { LoginDto } from '../../../dto/auth/login.dto';
import { ShopTypeDto } from '../../../dto/enumsOp/shop-type.dto';

// Enum
import { Stc, expandCollapse } from '../../../stc';
import { AppRouterService } from '../../../service/sys/router.service';
import { AppRoutes } from '../../../enum/sys/routes.enum';

@Component({
    selector: 'auth-register',
    templateUrl: './register.comp.html',
    animations: [expandCollapse]
})
export class AuthRegisterComp implements OnInit {
    registerDto: RegisterPersonDto;
    @ViewChild('registerForm', { static: false }) registerForm: NgForm;

    shopTypeList: ShopTypeDto[];

    show: boolean = false;

    busy: boolean;

    haveShopToo: boolean = false;

    constructor(
        private authService: AuthService,
        private toastr: ToastrService,
        private localStorageService: LocalStorageService,
        private enumsOpService: EnumsOpService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private appRouterService: AppRouterService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.registerDto = new RegisterPersonDto();

        this.show = !Stc.isRealLogin;
        if (Stc.isRealLogin) {

            setTimeout(() => {
                this.appRouterService.navigate(AppRoutes.homepage);
            });
        }

        this.getShopTypeList();
    }

    ngOnInit(): void {
    }

    register(): void {
        if (this.registerForm.invalid) {
            return;
        }
        if (this.registerDto.HaveShopToo && this.utils.isNull(this.registerDto.ShopShortName)) {
            this.dialogService.showError(this.dicService.getValue('xShopSignNameCantBeEmpty'));
            return;
        }
        if (this.registerDto.HaveShopToo && this.utils.isNull(this.registerDto.ShopTypeId)) {
            this.dialogService.showError(this.dicService.getValue('xSelectShopType'));
            return;
        }
        if (this.registerDto.Password.length > 10) {
            this.dialogService.showError(this.dicService.getValue('xPasswordCannotExceed10'));
            return;
        }

        this.busy = true;
        this.registerDto.LanguageId = this.localStorageService.LangId;
        this.registerDto.BirthdateNumber = null;
        this.registerDto.GenderId = null;
        let subs = this.authService.register(this.registerDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.toastr.success(`${this.registerDto.Name} ${this.registerDto.Surname}`, 'Üye Kaydı Oluşturuldu.');

                    this.login();

                    //this.authService.login()
                    //this.host.loginDto.Username = this.registerDto.Username;
                    //this.host.loginDto.Password = this.registerDto.Password;
                    //this.host.rememberMe = false;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'register', subs);
                this.busy = false;
            }
        );
    }

    login(): void {
        const loginDto = new LoginDto();
        loginDto.Username = this.registerDto.Username;
        loginDto.Password = this.registerDto.Password;
        loginDto.LanguageId = this.localStorageService.LangId;
        this.busy = true;
        let subs = this.authService.login(loginDto).subscribe(
            x => {
                this.busy = false;
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.authService.loginHandle(x.Dto, this.registerDto.Username, false);

                    this.appRouterService.navigatePrevUrl();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'login', subs);
                this.busy = false;
            }
        );
    }

    getShopTypeList(): void {
        this.shopTypeList = [];
        let subs = this.enumsOpService.getShopTypeList().subscribe(
            x => {
                this.utils.unsubs(subs);

                this.shopTypeList = x.Dto;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'sendPassword', subs);
            }
        );
    }
}