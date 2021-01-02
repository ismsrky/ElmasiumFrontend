import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

import { ModalDirective } from 'ngx-bootstrap/modal';

// Service
import { ApprovalFicheService } from '../../../../service/approval/fiche.service';
import { FicheService } from '../../../../service/fiche/fiche.service';
import { PersonAccountService } from '../../../../service/person/account.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { FicheDto } from '../../../../dto/fiche/fiche.dto';
import { FicheMoneyDto } from '../../../../dto/fiche/money/money.dto';
import { ApprovalFicheSaveDto } from '../../../../dto/approval/fiche/save.dto';
import { PersonAccountGetListCriteriaDto } from '../../../../dto/person/account/getlist-criteria.dto';

// Bo
import { PersonAccountCmbBo } from '../../../../bo/person/account/cmb.bo';

// Enum
import { Stats } from '../../../../enum/sys/stats.enum';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { AccountTypes } from '../../../../enum/person/account-type.enum';
import { ApprovalStats } from '../../../../enum/approval/stats.enum';
import { LogExceptionService } from '../../../../service/log/exception.service';


@Component({
    selector: 'approval-fiche-choice-index',
    templateUrl: './index.comp.html'
})
export class ApprovalFicheChoiceIndexComp implements OnInit, OnDestroy {
    accountTypes = AccountTypes;
    stats = Stats;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    debtAccountCmbBo: PersonAccountCmbBo[];
    creditAccountCmbBo: PersonAccountCmbBo[];

    busy: boolean = false;
    ficheDto: FicheDto;
    approvalFicheSaveDto: ApprovalFicheSaveDto;

    otherPersonId: number = null; // debt or credit
    amIDebtor: boolean = false;

    private _eventBus: Subject<FicheDto>;

    constructor(
        private approvalFicheService: ApprovalFicheService,
        private ficheService: FicheService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService,
        private dicService: DictionaryService,
        private personAccountService: PersonAccountService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private localStorageService: LocalStorageService) {
        this.ficheDto = new FicheDto(this.utils);

        this.debtAccountCmbBo = null;
        this.creditAccountCmbBo = null;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(ficheDto: FicheDto, approvalFicheSaveDto: ApprovalFicheSaveDto): Observable<FicheDto> {
        this._eventBus = new Subject<FicheDto>();

        this.ficheDto = ficheDto;
        this.approvalFicheSaveDto = approvalFicheSaveDto;

        this.modal.onHide.subscribe(
            x => {
                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'ApprovalFicheChoice');
            }
        );

        this.modal.show();

        this.otherPersonId = this.localStorageService.personProfile.PersonId == this.ficheDto.CreditPersonId ? this.ficheDto.DebtPersonId : this.ficheDto.CreditPersonId;

        this.amIDebtor = this.localStorageService.personProfile.PersonId == this.ficheDto.DebtPersonId;

        this.loadCmb();

        return this._eventBus.asObservable();
    }

    getCmb(ficheMoneyDto: FicheMoneyDto): PersonAccountCmbBo[] {
        if (this.amIDebtor)
            return this.debtAccountCmbBo.filter(x => x.accountTypeId == ficheMoneyDto.DebtPersonAccountTypeId);
        else
            return this.creditAccountCmbBo.filter(x => x.accountTypeId == ficheMoneyDto.CreditPersonAccountTypeId);
    }

    loadCmb(): void {
        if (this.amIDebtor) {
            this.debtAccountCmbBo = [];
        } else {
            this.creditAccountCmbBo = [];
        }

        let criteriaDto: PersonAccountGetListCriteriaDto;
        criteriaDto = new PersonAccountGetListCriteriaDto();
        criteriaDto.OwnerPersonId = this.localStorageService.personProfile.PersonId;
        criteriaDto.StatId = Stats.xActive;
        criteriaDto.CurrencyId = this.ficheDto.CurrencyId;
        this.busy = true;
        let subs = this.personAccountService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    let itemmmm = null;
                    x.Dto.forEach(a => {
                        if (this.amIDebtor)
                            itemmmm = this.debtAccountCmbBo.find(cmb => cmb.accountTypeId == a.AccountTypeId);
                        else
                            itemmmm = this.creditAccountCmbBo.find(cmb => cmb.accountTypeId == a.AccountTypeId);

                        if (this.utils.isNull(itemmmm)) {
                            const cmbItem = new PersonAccountCmbBo();
                            cmbItem.accountTypeId = a.AccountTypeId;
                            cmbItem.accountList = [];
                            x.Dto.filter(y => y.AccountTypeId == a.AccountTypeId).forEach(element => {
                                cmbItem.accountList.push(element);
                            });

                            if (this.amIDebtor)
                                this.debtAccountCmbBo.push(cmbItem);
                            else
                                this.creditAccountCmbBo.push(cmbItem);
                        }
                    });

                    this.busy = false;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadCmb', subs);
                this.busy = false;
            }
        );
    }

    save(): void {
        /**
         *  if (this.personAccountForm.invalid) {
            return;
        }
        if (this.personAccountForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
         */

        this.busy = true;
        this.approvalFicheSaveDto.ApprovalStatId = ApprovalStats.xAccepted;
        this.approvalFicheSaveDto.ChoiceReturnList = this.ficheDto.MoneyList;

        let subs = this.approvalFicheService.save(this.approvalFicheSaveDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({ 'ApprovalFicheSaved': { 'ficheId': this.ficheDto.Id, 'approvalStatId': this.approvalFicheSaveDto.ApprovalStatId } }));

                    this.toastr.success(this.ficheService.getFicheSavedText(this.approvalFicheSaveDto.ApprovalStatId));
                    this.modal.hide();
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
}