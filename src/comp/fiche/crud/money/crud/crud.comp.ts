/**
 * import { Component, OnInit, ViewChild, OnDestroy, Host } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

import { ModalDirective } from 'ngx-bootstrap/modal';

// Services
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';

// Component
import { FicheMoneyListIndexComp } from '../list/index.comp';

// Dto, Bo
import { FicheDto } from '../../../../../dto/fiche/fiche.dto';
import { FicheMoneyDto } from '../../../../../dto/fiche/money/money.dto';
import { PersonRelationListDto } from '../../../../../dto/person/relation/list.dto';
import { PersonAccountListDto } from '../../../../../dto/person/account/list.dto';
import { PersonAccountCmbBo } from '../../../../../bo/person/account/cmb.bo';

// Enums
import { Stats } from '../../../../../enum/sys/stats.enum';
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { AccountTypes } from '../../../../../enum/person/account-type.enum';
import { DialogButtons } from '../../../../../enum/sys/dialog/dialog-buttons.enum';
import { DialogIcons } from '../../../../../enum/sys/dialog/dialog-icons.enum';
import { Stc } from '../../../../../stc';

@Component({
    selector: 'fiche-money-crud',
    templateUrl: './crud.comp.html'
})
/**
 * Notes: This comp works well but for now it is not used. So do not delete this.
 * We dont use this comp because we use 'FicheMoneyOneComp' instead of this.
 
export class FicheMoneyCrudComp implements OnInit, OnDestroy {
    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;
    @ViewChild('ficheMoneyForm') ficheMoneyForm: NgForm;

    debtAccountCmbBo: PersonAccountCmbBo[];
    creditAccountCmbBo: PersonAccountCmbBo[];

    accountTypes = AccountTypes;
    stats = Stats;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService) {
        this.debtAccountCmbBo = [];
        this.creditAccountCmbBo = [];

        this.ficheDto = new FicheDto();
        this.ficheMoneyDto = new FicheMoneyDto();
    }

    busy: boolean = false;
    host: FicheMoneyListIndexComp;
    ficheDto: FicheDto;
    ficheMoneyDto: FicheMoneyDto;

    private _eventBus: Subject<FicheMoneyDto>;

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(ficheMoneyDto: FicheMoneyDto, ficheDto: FicheDto,
        debtAccountCmbBo: PersonAccountCmbBo[], creditAccountCmbBo: PersonAccountCmbBo[]): Observable<FicheMoneyDto> {
        this.ficheDto = ficheDto;
        this.debtAccountCmbBo = debtAccountCmbBo;
        this.creditAccountCmbBo = creditAccountCmbBo;

        if (ficheMoneyDto == undefined || ficheMoneyDto == null) {
            this.ficheMoneyDto = new FicheMoneyDto();
        } else {
            this.ficheMoneyDto = ficheMoneyDto;
        }

        this.ficheMoneyDto.CurrencyId = this.ficheDto.CurrencyId;

        this._eventBus = new Subject<FicheMoneyDto>();

        let subscribeCloseModal = this.modal.onHide.subscribe(
            () => {
                this.utils.unsubs(subscribeCloseModal);

                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }
                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'FicheMoney');
            }
        );



        this.modal.show();

        if (this.ficheMoneyDto.Id > 0) {
            //this.loadData(personAccountId);
        } else { // new account
            //this.modal.show();
        }

        return this._eventBus.asObservable();
    }

    save(): void {
        if (this.ficheMoneyForm.invalid) {
            return;
        }
        if (this.ficheMoneyForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        if (this.ficheMoneyDto.Total <= 0) {
            this.dialogService.show({
                text: 'Lütfen 0"dan büyük bir tutar giriniz.',
                icon: DialogIcons.Warning,
                buttons: DialogButtons.OK,
                closeIconVisible: true
            });
            return;
        }

        // User cannot select type if it is unknown.
        if (this.ficheDto.IsDebtMaster) {
            this.ficheMoneyDto.DebtPersonAccountTypeId = this.getAccountTypeId(this.debtAccountCmbBo, this.ficheMoneyDto.DebtPersonAccountId);

            this.debtAccountCmbBo.forEach(x => {
                let valueee = x.accountList.find(y => y.Id == this.ficheMoneyDto.DebtPersonAccountId);
                if (this.utils.isNotNull(valueee)) {
                    this.ficheMoneyDto.DebtPersonAccountName = valueee.Name;
                    return;
                }
            });
        }
        if (this.ficheDto.IsCreditMaster) {
            this.ficheMoneyDto.CreditPersonAccountTypeId = this.getAccountTypeId(this.creditAccountCmbBo, this.ficheMoneyDto.CreditPersonAccountId);

            this.creditAccountCmbBo.forEach(x => {
                let valueee = x.accountList.find(y => y.Id == this.ficheMoneyDto.CreditPersonAccountId);
                if (this.utils.isNotNull(valueee)) {
                    this.ficheMoneyDto.CreditPersonAccountName = valueee.Name;
                    return;
                }
            });
        }
        
        setTimeout(() => {
            this._eventBus.next(this.ficheMoneyDto);
            this.modal.hide();
        });
    }

    getAccountTypeId(cmb: PersonAccountCmbBo[], accountId: number): AccountTypes {
        let t_account: PersonAccountListDto;
        let result: AccountTypes = null;
        cmb.forEach(element => {
            t_account = element.accountList.find(x => x.Id == accountId);

            if (this.utils.isNotNull(t_account)) {
                result = t_account.AccountTypeId;
                return result;
            }
        });

        return result;
    }
}
 */