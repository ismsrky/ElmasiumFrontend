import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Service
import { PersonService } from '../../../../service/person/person.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonChangeSelectedCurrencyDto } from '../../../../dto/person/change-currency.dto';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { Currencies } from '../../../../enum/person/currencies.enum';

@Component({
    selector: 'person-mine-currency',
    templateUrl: './currency.comp.html'
})
export class PersonMineCurrencyComp implements OnInit {
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    selectedCurrencyId: Currencies;
    currencies = Currencies;

    busy: boolean = false;
    constructor(
        private personService: PersonService,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.selectedCurrencyId = this.localStorageService.personProfile.SelectedCurrencyId;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(): void {
        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                subscribeCloseModal.unsubscribe();

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonMineCurrency');
            }
        );

        this.modal.show();
    }

    currencyChanged(): void {
        const selectedPerson = this.localStorageService.personProfile;

        selectedPerson.SelectedCurrencyId = this.selectedCurrencyId;
        this.localStorageService.setPersonProfile(selectedPerson);

        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'CurrencyChanged');

        const selectedCurrencyDto = new PersonChangeSelectedCurrencyDto();
        selectedCurrencyDto.CurrencyId = selectedPerson.SelectedCurrencyId;
        this.busy = true;
        let subs = this.personService.changeSelectedCurrency(selectedCurrencyDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    //this.toastr.success(this.dicService.getValue('xCurrencyChangedSuccessful'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'currencyChanged', subs);
                this.busy = false;
            }
        );

        /**
         * const realPerson = this.localStorageService.realPerson;
        if (selectedPerson.PersonId == realPerson.Id) {
            realPerson.DefaultCurrencyId = selectedPerson.DefaultCurrencyId;
            this.localStorageService.setRealPerson(realPerson);
        }
         */

        this.modal.hide();
    }
}