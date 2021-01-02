import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Service
import { PersonAccountService } from '../../../../service/person/account.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonAccountListDto } from '../../../../dto/person/account/list.dto';
import { PersonAccountDto } from '../../../../dto/person/account/account.dto';
import { PersonAccountGetCriteriaDto } from '../../../../dto/person/account/get-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { Stats } from '../../../../enum/sys/stats.enum';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { AccountTypes } from '../../../../enum/person/account-type.enum';
import { Currencies } from '../../../../enum/person/currencies.enum';
import { PersonTypes } from '../../../../enum/person/person-types.enum';

@Component({
    selector: 'person-account-crud',
    templateUrl: './crud.comp.html'
})
export class PersonAccountCrudComp implements OnInit, OnDestroy {
    @Input('personAccountListDto') personAccountListDto: PersonAccountListDto;
    profile: PersonProfileBo;

    accountTypes = AccountTypes;
    currencies = Currencies;
    stats = Stats;
    personTypes = PersonTypes;

    @ViewChild('personAccountForm', { static: false }) personAccountForm: NgForm;

    busy: boolean = false;
    personAccountDto: PersonAccountDto;

    subsNeedRefresh: Subscription;

    constructor(
        private personAccountService: PersonAccountService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;

        this.personAccountDto = new PersonAccountDto();
    }

    showModal(personAccountId: number): void {
        this.personAccountDto = new PersonAccountDto();

        if (personAccountId > 0) {
            this.loadData(personAccountId);
        } else { // new account
            this.personAccountDto.CurrencyId = this.profile.SelectedCurrencyId;
            this.personAccountDto.Balance = 0;
        }
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                    this.personAccountListDto.IsCrudOpen = false;
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    loadData(personAccountId: number): void {
        this.busy = true;

        const criteriaDto = new PersonAccountGetCriteriaDto();
        criteriaDto.AccountId = personAccountId;
        let subs = this.personAccountService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.personAccountDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    save(): void {
        if (this.personAccountForm.invalid) {
            return;
        }
        if (this.personAccountForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }

        if (this.profile.PersonTypeId != PersonTypes.xShop) {
            this.personAccountDto.IsFastRetail = false;
        }

        this.busy = true;
        let subs = this.personAccountService.save(this.personAccountDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.personAccountDto.Id = x.ReturnedId;

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, 'PersonAccount');

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));

                    this.personAccountListDto.IsCrudOpen = false;
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
        this.personAccountListDto.IsCrudOpen = false;
    }
}