/**
 * import { Component, OnInit, ViewChild, OnDestroy, Host, Input } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';

// Services
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';

//Components
import { FicheMoneyCrudComp } from '../crud/crud.comp';

// Enums
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../enum/sys/dialog/dialog-buttons.enum';
import { FicheCrudComp } from '../../crud.comp';
import { FicheMoneyDto } from '../../../../../dto/fiche/money/money.dto';
import { Stc, expandCollapse } from '../../../../../stc';
import { PersonAccountCmbBo } from '../../../../../bo/person/account/cmb.bo';
import { PersonAccountGetListCriteriaDto } from '../../../../../dto/person/account/getlist-criteria.dto';
import { Stats } from '../../../../../enum/sys/stats.enum';
import { PersonAccountService } from '../../../../../service/person/account.service';

@Component({
    selector: 'fiche-money-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
/**
 * Notes: This comp works well but for now it is not used. So do not delete this.
 * We dont use this comp because we use 'FicheMoneyOneComp' instead of this.

export class FicheMoneyListIndexComp implements OnInit, OnDestroy {
    constructor(
        @Host() host: FicheCrudComp,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private personAccountService: PersonAccountService) {

        this.host = host;
    }

    busy: boolean = false;

    host: FicheCrudComp;

    modalClosedSubscription: Subscription;

    @ViewChild(FicheMoneyCrudComp) moneyCrud: FicheMoneyCrudComp;

    ngOnInit(): void {
        this.modalClosedSubscription = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            message => {
                if (message == 'FicheMoney') {
                    this.isModalOpen = false;
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.modalClosedSubscription);
    }
    getNextId(): number {
        let result: number = 0;

        while (this.host.ficheDto.MoneyList.find(x => x.Id == result)) {
            result--;
        }

        return result;
    }

    finishedCredit: boolean = false;
    finishedDebt: boolean = false;


    isModalOpen: boolean = false;
    getPersonAccounts(personId: number): Observable<PersonAccountCmbBo[]> {
        const _eventBus: Subject<PersonAccountCmbBo[]> = new Subject<PersonAccountCmbBo[]>();

        let accountCmbBo: PersonAccountCmbBo[] = [];

        let criteriaDto: PersonAccountGetListCriteriaDto;
        criteriaDto = new PersonAccountGetListCriteriaDto();
        criteriaDto.StatId = Stats.xActive;
        criteriaDto.CurrencyId = this.host.ficheDto.CurrencyId;

        criteriaDto.OwnerPersonId = personId;

        let subscribeAccount = this.personAccountService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subscribeAccount);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let cnt = 0;
                        x.Dto.forEach(a => {
                            cnt++;

                            let itemmmm = accountCmbBo.find(cmb => cmb.accountTypeId == a.AccountTypeId);

                            if (this.utils.isNull(itemmmm)) {
                                const cmbItem = new PersonAccountCmbBo();
                                cmbItem.accountTypeId = a.AccountTypeId;
                                cmbItem.accountList = [];
                                x.Dto.filter(y => y.AccountTypeId == a.AccountTypeId).forEach(element => {
                                    cmbItem.accountList.push(element);
                                });

                                accountCmbBo.push(cmbItem);
                            }

                            if (cnt == x.Dto.length) {
                                _eventBus.next(accountCmbBo);
                            }
                        });
                    } else {
                        _eventBus.next(null);
                    }
                } else {
                    _eventBus.next(null);
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.utils.unsubs(subscribeAccount);
                this.busy = false;

                _eventBus.next(null);
            }
        );

        return _eventBus.asObservable();
    }
    openModal(id: number) {
        const isNew: boolean = id == null;

        if (this.host.otherPersonRelation.RelatedPersonId == null) {
            this.dialogService.show({
                text: 'Lütfen bir tane bağlantı seçiniz.',
                icon: DialogIcons.Warning,
                buttons: DialogButtons.OK,
                closeIconVisible: true
            });

            return;
        }

        let moneyDto: FicheMoneyDto = new FicheMoneyDto();
        if (isNew) {
            id = this.getNextId();
            moneyDto.Id = id;
        } else {
            moneyDto.copy(this.host.ficheDto.MoneyList.find(x => x.Id == id));
        }

        this.isModalOpen = true;

        let debtAccountCmbBo: PersonAccountCmbBo[] = [];
        let creditAccountCmbBo: PersonAccountCmbBo[] = [];

        let subscribeGetAccountsDebt = this.getPersonAccounts(this.host.ficheDto.DebtPersonId).subscribe(
            x => {
                this.utils.unsubs(subscribeGetAccountsDebt);
                debtAccountCmbBo = x;

                let subscribeGetAccountsCredit = this.getPersonAccounts(this.host.ficheDto.CreditPersonId).subscribe(
                    x => {
                        this.utils.unsubs(subscribeGetAccountsCredit);
                        creditAccountCmbBo = x;

                        if ((this.host.ficheDto.IsDebtMaster && (this.utils.isNull(debtAccountCmbBo) || debtAccountCmbBo.length == 0))
                            || (this.host.ficheDto.IsCreditMaster && (this.utils.isNull(creditAccountCmbBo) || creditAccountCmbBo.length == 0))) {
                            this.dialogService.show({
                                text: 'Seçtiğiniz profilin(' + this.host.profile.FullName + ') kriterlere uygun hiç para hesabı yok.',
                                icon: DialogIcons.Question,
                                buttons: DialogButtons.OK,
                                closeIconVisible: true
                            });
                        } else {
                            let subscribeCloseMoneyModal = this.moneyCrud.showModal(moneyDto,
                                this.host.ficheDto, debtAccountCmbBo, creditAccountCmbBo).subscribe(
                                    x => {
                                        this.utils.unsubs(subscribeCloseMoneyModal);

                                        if (isNew) {
                                            this.host.ficheDto.MoneyList.push(x);
                                        } else {
                                            let ind = this.host.ficheDto.MoneyList.findIndex(x => x.Id == id);
                                            this.host.ficheDto.MoneyList[ind] = x;
                                        }

                                        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheCalculation');
                                    }
                                );
                        }
                    },
                    err => {
                        this.utils.unsubs(subscribeGetAccountsCredit);
                    }
                );
            },
            err => {
                this.utils.unsubs(subscribeGetAccountsDebt);
            }
        );

    }

    delete(id: number): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDeleteMoney'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.removeItem(id);
            },
            no: () => {
            }
        });
    }

    removeItem(id: number) {
        const ind: number = this.host.ficheDto.MoneyList.findIndex(x => x.Id == id);
        this.host.ficheDto.MoneyList.splice(ind, 1);

        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheCalculation');
    }
}
 */