import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LoginDto } from '../../dto/auth/login.dto';
import { LoginReturnDto } from '../../dto/auth/login-return.dto';

import { RegisterPersonDto } from '../../dto/auth/register-person.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';
import { AuthForgotPasswordDto } from '../../dto/auth/forgot-password.dto';
import { LoginAsAnonymousDto } from '../../dto/auth/login-anonymous.dto';
import { RealPersonBo } from '../../bo/person/real/real-person.bo';
import { RelationTypes } from '../../enum/person/relation-types.enum';
import { PersonTypes } from '../../enum/person/person-types.enum';
import { PersonProfileBo } from '../../bo/person/profile.bo';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { RealPersonRememberBo } from '../../bo/person/real/real-person-remember';
import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { AppRouterService } from '../sys/router.service';
import { Stc } from '../../stc';
import { AppRoutes } from '../../enum/sys/routes.enum';
import { ToastrService } from 'ngx-toastr';
import { DictionaryService } from '../dictionary/dictionary.service';
import { UtilService } from '../sys/util.service';
import { EssentialService } from '../sys/essential.service';

@Injectable()
export class AuthService extends BaseService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private utils: UtilService,
    private compBroadCastService: CompBroadCastService,
    private dicService: DictionaryService,
    private appRouterService: AppRouterService,
    private essentialService: EssentialService,
    private toastr: ToastrService) {

    super(http, localStorageService, utils);
    super.setControllerName('Auth');
  }

  login(loginDto: LoginDto): Observable<ResponseGenDto<LoginReturnDto>> {
    return super.post('Login', loginDto);
  }

  loginAsAnonymous(loginAsAnonymousDto: LoginAsAnonymousDto): Observable<ResponseGenDto<LoginReturnDto>> {
    return super.post('LoginAsAnonymous', loginAsAnonymousDto);
  }

  logout(): Observable<ResponseDto> {
    return super.post('Logout', null);
  }

  isLogin(): Observable<ResponseDto> {
    return super.post('IsLogin', null);
  }

  isRealLogin(): Observable<ResponseDto> {
    return super.post('IsRealLogin', null);
  }

  isAdmin(): Observable<ResponseDto> {
    return super.post('IsAdmin', null);
  }

  register(registerPersonDto: RegisterPersonDto): Observable<ResponseDto> {
    return super.post('Register', registerPersonDto);
  }

  sendForgotPassword(forgotPasswordDto: AuthForgotPasswordDto): Observable<ResponseDto> {
    return super.post('SendForgotPassword', forgotPasswordDto);
  }
  sendVerifyEmail(): Observable<ResponseDto> {
    return super.post('SendVerifyEmail', null);
  }
  isEmailVerified(): Observable<ResponseDto> {
    return super.post('IsEmailVerified', null);
  }

  handleRealLoginRequired(): boolean {
    if (!Stc.isRealLogin) {
      this.toastr.warning(this.dicService.getValue('xLoginRequired'));

      this.appRouterService.navigate(AppRoutes.login);

      return false;
    }
    return true;
  }

  loginHandle(dto: LoginReturnDto, username: string, rememberMe: boolean): void {
    Stc.isLogin = true;
    Stc.isRealLogin = dto.Id != -2;

    const realPerson = new RealPersonBo();
    realPerson.Id = dto.Id;
    realPerson.TokenId = dto.TokenId;
    realPerson.Username = username;
    realPerson.Name = dto.Name;
    realPerson.Surname = dto.Surname;
    realPerson.DefaultCurrencyId = dto.DefaultCurrencyId;
    realPerson.GenderId = dto.GenderId;
    realPerson.FullName = `${realPerson.Name} ${realPerson.Surname}`;
    realPerson.IsAnonymous = !Stc.isRealLogin;
    this.localStorageService.setRealPerson(realPerson);

    const personProfile = new PersonProfileBo();
    personProfile.PersonId = realPerson.Id;
    personProfile.PersonTypeId = PersonTypes.xRealPerson;
    personProfile.FullName = realPerson.FullName;
    personProfile.DefaultCurrencyId = realPerson.DefaultCurrencyId;
    personProfile.SelectedCurrencyId = personProfile.DefaultCurrencyId;
    personProfile.RelationTypeIdList = [];
    personProfile.RelationTypeIdList.push(RelationTypes.xMyself);
    this.localStorageService.setPersonProfile(personProfile);

    if (rememberMe) {
      const personRemember = new RealPersonRememberBo();
      personRemember.Username = username;
      this.localStorageService.realPersonRemember = personRemember;
    } else {
      //this.localStorageService.realPersonRemember = undefined;
    }

    // this.essentialService.getOrderStatList();
    // this.essentialService.getStatNextList();
    // this.essentialService.getNotificationSummary();

    this.essentialService.load();

    this.compBroadCastService.sendMessage(CompBroadCastTypes.Login);
    this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'ProfileChanged');
  }
}