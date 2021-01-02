import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { timer, Subscription } from 'rxjs';
import { CurrencyMaskConfig } from 'ngx-currency';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

// Service
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { PersonVerifyPhoneService } from '../../../service/person/verify-phone.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PersonVerifyPhoneGenDto } from '../../../dto/person/verify-phone/gen.dto';
import { PersonVerifyPhoneGenReturnDto } from '../../../dto/person/verify-phone/gen-return.dto';
import { PersonVerifyPhoneSaveDto } from '../../../dto/person/verify-phone/save.dto';

// Bo
import { ModalPersonVerifyPhoneBo } from '../../../bo/modal/person-verify-phone.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'person-verify-phone',
    templateUrl: './verify-phone.comp.html',
    animations: [expandCollapse]
})
export class PersonVerifyPhoneComp implements OnInit {
    personVerifyPhoneBo: ModalPersonVerifyPhoneBo;

    genReturnDto: PersonVerifyPhoneGenReturnDto;
    saveDto: PersonVerifyPhoneSaveDto;

    @ViewChild('verifyPhoneForm', { static: false }) verifyPhoneForm: NgForm;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    configPositiveInt: CurrencyMaskConfig;

    countDown: number = 0;

    timerCountDown = timer(0, 1000);
    subscriptionCountDown: Subscription;

    busy: boolean = false;

    constructor(
        private personVerifyPhoneService: PersonVerifyPhoneService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.configPositiveInt = this.utils.getPositiveIntMaskOptions();
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionCountDown);
    }

    showModal(personVerifyPhoneBo: ModalPersonVerifyPhoneBo): void {
        this.personVerifyPhoneBo = personVerifyPhoneBo;

        this.gen();

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                subscribeCloseModal.unsubscribe();

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonVerifyPhoneComp');
            }
        );

        this.modal.show();
    }

    gen(): void {
        this.utils.unsubs(this.subscriptionCountDown);

        const genDto = new PersonVerifyPhoneGenDto();
        genDto.PersonId = this.personVerifyPhoneBo.PersonId;
        genDto.Phone = this.personVerifyPhoneBo.Phone;
        let subs = this.personVerifyPhoneService.gen(genDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                this.genReturnDto = x.Dto;

                if (x.IsSuccess) {
                    this.genReturnDto = x.Dto;
                    this.saveDto = new PersonVerifyPhoneSaveDto();
                    this.saveDto.Id = x.ReturnedId;

                    this.countDown = this.genReturnDto.CountDownInSeconds;

                    this.subscriptionCountDown = this.timerCountDown.subscribe(
                        x => {
                            if (this.countDown > 0) {
                                this.countDown--;
                            }
                        }
                    );
                } else {
                    this.cancel();
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'gen', subs);
            }
        );
    }

    save(): void {
        if (this.verifyPhoneForm.invalid) {
            return;
        }

        this.busy = true;
        let subs = this.personVerifyPhoneService.save(this.saveDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.modal.hide();

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, 'PersonVerifyPhoneComp');

                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;
            }
        );
    }

    cancel(): void {
        this.modal.hide();
    }
}