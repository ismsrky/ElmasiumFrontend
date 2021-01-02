import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Service
import { RealPersonService } from '../../../../service/person/real.service';
import { PersonVerifyPhoneService } from '../../../../service/person/verify-phone.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { UtilService } from '../../../../service/sys/util.service';
import { LogExceptionService } from '../../../../service/log/exception.service';

// Dto
import { PersonVerifyPhoneGenDto } from '../../../../dto/person/verify-phone/gen.dto';
import { RealPersonDto } from '../../../../dto/person/real/real-person.dto';

// Bo
import { RealPersonBo } from '../../../../bo/person/real/real-person.bo';
import { ModalPersonVerifyPhoneBo } from '../../../../bo/modal/person-verify-phone.bo';
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { Currencies } from '../../../../enum/person/currencies.enum';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-my-profile-general',
    templateUrl: './general.comp.html',
    animations: [expandCollapse]
})
export class PersonMyProfileGeneralComp implements OnInit, OnDestroy {
    tabPageIndex: number = 0;

    isPhoneVerified: boolean = null;

    realPersonDto: RealPersonDto;
    currencies = Currencies;

    busy: boolean = false;

    @ViewChild('myProfileForm', { static: false }) myProfileForm: NgForm;

    subsSaved: Subscription;

    profile: PersonProfileBo;
    constructor(
        private realPersonService: RealPersonService,
        private personVerifyPhoneService: PersonVerifyPhoneService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private localStorageService: LocalStorageService,
        private location: Location,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
        this.realPersonDto = new RealPersonDto();
    }

    ngOnInit(): void {
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (x == 'PersonVerifyPhoneComp') {
                    this.checkPhoneVerified();
                }
            }
        );

        this.loadData();
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsSaved);
    }

    loadData(): void {
        this.busy = true;
        let subs = this.realPersonService.get().subscribe(
            data => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (data.IsSuccess) {
                    this.realPersonDto = data.Dto;

                    this.realPersonDto.Birthdate = this.utils.isNull(data.Dto.BirthdateNumber) ? null : new Date(data.Dto.BirthdateNumber);

                    this.checkPhoneVerified();
                } else {
                    this.dialogService.showError(data.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            });
    }
    saveMyProfile(): void {
        if (this.myProfileForm.invalid) {
            return;
        }
        if (this.myProfileForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }

        this.busy = true;

        this.myProfileForm.form.markAsPristine();

        this.realPersonDto.BirthdateNumber = this.utils.getDateNumber(this.realPersonDto.Birthdate);

        let subs = this.realPersonService.update(this.realPersonDto).subscribe(
            data => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (data.IsSuccess) {
                    let realPersonBo: RealPersonBo;
                    realPersonBo = this.localStorageService.realPerson.copy();
                    realPersonBo.DefaultCurrencyId = this.realPersonDto.DefaultCurrencyId;

                    this.localStorageService.setRealPerson(realPersonBo);

                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));

                    const profile = this.localStorageService.personProfile;
                    if (profile.PersonId == this.localStorageService.realPerson.Id) {
                        profile.FullName = `${this.realPersonDto.Name} ${this.realPersonDto.Surname}`;
                        profile.DefaultCurrencyId = this.realPersonDto.DefaultCurrencyId;
                        profile.SelectedCurrencyId = this.realPersonDto.DefaultCurrencyId;

                        this.localStorageService.setPersonProfile(profile);

                        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'ProfileChanged');
                    }

                    this.checkPhoneVerified();
                } else {
                    this.dialogService.showError(data.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'saveMyProfile', subs);
                this.busy = false;
            }
        );
    }

    verifyPhone(): void {
        const personVerifyPhoneBo = new ModalPersonVerifyPhoneBo();
        personVerifyPhoneBo.PersonId = this.profile.PersonId;
        personVerifyPhoneBo.Phone = this.realPersonDto.Phone;
        this.personVerifyPhoneService.showModal(personVerifyPhoneBo);
    }

    checkPhoneVerified(): void {
        const genDto = new PersonVerifyPhoneGenDto();
        genDto.PersonId = this.profile.PersonId;;
        genDto.Phone = this.realPersonDto.Phone;
        let subs = this.personVerifyPhoneService.isVerified(genDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.ReturnedId) && x.ReturnedId > 0) {
                        this.isPhoneVerified = true;
                    } else {
                        this.isPhoneVerified = false;
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'checkPhoneVerified', subs);
            }
        );
    }

    cancel(): void {
        this.location.back();
    }
}