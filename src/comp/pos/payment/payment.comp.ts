import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

// Service
import { DialogService } from '../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';

// Dto
import { FicheDto } from '../../../dto/fiche/fiche.dto';
import { FicheMoneyDto } from '../../../dto/fiche/money/money.dto';
import { PersonAccountListDto } from '../../../dto/person/account/list.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { AccountTypes } from '../../../enum/person/account-type.enum';
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { Currencies } from '../../../enum/person/currencies.enum';
import { Stc } from '../../../stc';
import { UtilService } from '../../../service/sys/util.service';

@Component({
    selector: 'pos-payment',
    templateUrl: './payment.comp.html'
})
export class PosPaymentComp {
    @ViewChild('paymentForm', { static: false }) paymentForm: NgForm;

    paidTotal: number = 0;
    remainingTotal: number = 0;
    cashChange: number = 0;

    configCurrency: CurrencyMaskConfig;

    ficheDto: FicheDto;

    shopAccountListDto: PersonAccountListDto[]; // All types of account of the given shop
    shopCashAccountListDto: PersonAccountListDto[];
    shopBankAccountListDto: PersonAccountListDto[];

    SelectedCashAccountId: number = null;
    SelectedBankAccountIdForCreditCard: number = null;
    SelectedBankAccountIdForBankCard: number = null;

    Notes: string = null;

    CashTotal: number = 0;
    CreditCardTotal: number = 0;
    BankCardTotal: number = 0;
    ActualCashTotal: number = 0; // remains of cash minus cashback.

    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;

    ficheMoneyDtoList: FicheMoneyDto[];
    private _eventBus: Subject<FicheMoneyDto[]>;

    @ViewChild('txtCode', { static: false }) txtCashTotal: any;

    busy: boolean = false;

    constructor(
        private dialogService: DialogService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private utils: UtilService) {
        this.ficheDto = new FicheDto(this.utils);

        this.shopAccountListDto = [];
        this.shopCashAccountListDto = [];
        this.shopBankAccountListDto = [];

        this.configCurrency = this.utils.getCurrencyMaskOptions(Currencies.xTurkishLira); // just for default value.
    }

    paidChange(value: number, type: number) {
        value = Number(value);
        switch (type) {
            case 0:
                this.CashTotal = value;
                break;
            case 1:
                this.CreditCardTotal = value;
                break;
            case 2:
                this.BankCardTotal = value;
                break;
        }
        this.calculate();
    }

    calculate(): boolean {
        this.CashTotal = this.utils.round(this.CashTotal, 2);
        this.CreditCardTotal = this.utils.round(this.CreditCardTotal, 2);
        this.BankCardTotal = this.utils.round(this.BankCardTotal, 2);

        if (this.CashTotal < 0 || this.CreditCardTotal < 0 || this.BankCardTotal < 0) {
            this.toastr.warning('Lütfen 0"dan büyük bir değer giriniz.');

            if (this.CashTotal < 0) this.CashTotal = 0;
            if (this.CreditCardTotal < 0) this.CreditCardTotal = 0;
            if (this.BankCardTotal < 0) this.BankCardTotal = 0;

            return false;
        }

        // payment cannot be greater than grand total
        if (this.utils.round(this.CreditCardTotal + this.BankCardTotal, 2) > this.ficheDto.GrandTotal) {
            this.remainingTotal = 0;
            this.toastr.warning('Toplam ödenen tutar genel tutarı geçemez.');
            return false;
        }

        const cashRemaining: number = this.utils.round(this.ficheDto.GrandTotal - (this.CreditCardTotal + this.BankCardTotal), 2);
        this.cashChange = this.utils.round(this.CashTotal - cashRemaining, 2);
        this.cashChange = this.cashChange < 0 ? 0 : this.cashChange;

        this.ActualCashTotal = this.utils.round(this.CashTotal - this.cashChange, 2);


        this.paidTotal = this.utils.round(this.ActualCashTotal + this.BankCardTotal + this.CreditCardTotal, 2);

        this.remainingTotal = this.utils.round(this.ficheDto.GrandTotal - this.paidTotal, 2);

        return this.calculatePaymentDto();
    }

    calculatePaymentDto(): boolean {
        this.ficheMoneyDtoList = [];

        let t_payment: FicheMoneyDto = null;

        // cash payment
        if (this.ActualCashTotal > 0) {
            t_payment = new FicheMoneyDto();

            // info of shop.
            t_payment.DebtPersonAccountId = this.SelectedCashAccountId;
            t_payment.DebtPersonAccountTypeId = AccountTypes.xCash;

            // info of customer.
            t_payment.CreditPersonAccountId = null; // we don't know his account.
            t_payment.CreditPersonAccountTypeId = AccountTypes.xCash;

            t_payment.Total = this.ActualCashTotal;

            this.ficheMoneyDtoList.push(t_payment);
        }

        // credit card payment
        if (this.CreditCardTotal > 0) {
            t_payment = new FicheMoneyDto();

            // info of shop.
            t_payment.DebtPersonAccountId = this.SelectedBankAccountIdForCreditCard;
            t_payment.DebtPersonAccountTypeId = AccountTypes.xBank;

            // info of customer.
            t_payment.CreditPersonAccountId = null; // we don't know his account.
            t_payment.CreditPersonAccountTypeId = AccountTypes.xCreditCard;

            t_payment.Total = this.CreditCardTotal;

            this.ficheMoneyDtoList.push(t_payment);
        }

        // bank card payment
        if (this.BankCardTotal > 0) {
            t_payment = new FicheMoneyDto();

            // info of shop.
            t_payment.DebtPersonAccountId = this.SelectedBankAccountIdForBankCard;
            t_payment.DebtPersonAccountTypeId = AccountTypes.xBank;

            // info of customer.
            t_payment.CreditPersonAccountId = null; // we don't know his account.
            t_payment.CreditPersonAccountTypeId = AccountTypes.xBank;

            t_payment.Total = this.BankCardTotal;

            this.ficheMoneyDtoList.push(t_payment);
        }

        return true;
    }

    showModal(ficheDto: FicheDto, shopAccountListDto: PersonAccountListDto[]): Observable<FicheMoneyDto[]> {
        this._eventBus = new Subject<FicheMoneyDto[]>();
        this.ficheDto = ficheDto;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.ficheDto.CurrencyId);

        // shopAccountListDto cannot be empty and it must have at least one cash or one bank account.
        // Otherwise this screen cannot be openned.
        this.shopAccountListDto = shopAccountListDto;
        this.shopCashAccountListDto = this.shopAccountListDto.filter(x => x.AccountTypeId == AccountTypes.xCash);
        this.shopBankAccountListDto = this.shopAccountListDto.filter(x => x.AccountTypeId == AccountTypes.xBank);

        if (this.shopCashAccountListDto && this.shopCashAccountListDto.length == 1) {
            this.SelectedCashAccountId = this.shopCashAccountListDto[0].Id;
        }
        if (this.shopBankAccountListDto && this.shopBankAccountListDto.length == 1) {
            this.SelectedBankAccountIdForCreditCard = this.shopBankAccountListDto[0].Id;
            this.SelectedBankAccountIdForBankCard = this.shopBankAccountListDto[0].Id;
        }

        this.CashTotal = 0;
        this.CreditCardTotal = 0;
        this.CreditCardTotal = 0;
        this.calculate();

        this.txtCashTotal.nativeElement.focus();

        let subscribeCloseModal = this.modal.onHide.subscribe(
            () => {
                this.utils.unsubs(subscribeCloseModal);

                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PosPayment');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    save(): void {
        /**
         * if (this.paymentForm.invalid) {
            return;
        }
         */

        if (this.calculate() == false) return;

        if (this.ficheDto.GrandTotal == this.remainingTotal && this.ficheDto.DebtPersonId > 0) {
            this.dialogService.show({
                text: this.dicService.getValue('xConfirmNoPaymentPos'),
                icon: DialogIcons.Warning,
                buttons: DialogButtons.YesNo,
                closeIconVisible: true,
                yes: () => {
                    this.finish();
                }
            });
        } else if (this.remainingTotal > 0 && this.ficheDto.DebtPersonId > 0) {
            this.dialogService.show({
                text: this.dicService.getValue('xConfirmMissingPaymentPos'),
                icon: DialogIcons.Warning,
                buttons: DialogButtons.YesNo,
                closeIconVisible: true,
                yes: () => {
                    this.finish();
                }
            });
        } else if (this.ficheDto.DebtPersonId <= -1 && (this.ficheDto.GrandTotal == this.remainingTotal || this.remainingTotal > 0)) {
            this.dialogService.showError('Varsayılan müşteriye veresiye satış yapılamaz. Lütfen müşteri seçiniz.');
            return;
        }
        else {
            this.finish();
        }
    }

    finish(): void {
        this._eventBus.next(this.ficheMoneyDtoList);
        this.modal.hide();
    }

    accountChanged(): void {
        if (this.utils.isNull(this.SelectedCashAccountId)) {
            this.CashTotal = 0;
        }
        if (this.utils.isNull(this.SelectedBankAccountIdForCreditCard)) {
            this.CreditCardTotal = 0;
        }
        if (this.utils.isNull(this.SelectedBankAccountIdForBankCard)) {
            this.BankCardTotal = 0;
        }
        this.calculate();
    }
}