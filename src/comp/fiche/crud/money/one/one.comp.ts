import { Component, OnInit, OnDestroy, Host } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';

// Comp
import { FicheCrudComp } from '../../crud.comp';

// Service
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonAccountListDto } from '../../../../../dto/person/account/list.dto';
import { PersonAccountGetListCriteriaDto } from '../../../../../dto/person/account/getlist-criteria.dto';
import { FicheMoneyDto } from '../../../../../dto/fiche/money/money.dto';

// Bo
import { PersonAccountCmbBo } from '../../../../../bo/person/account/cmb.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../enum/sys/dialog/dialog-buttons.enum';
import { Stats } from '../../../../../enum/sys/stats.enum';
import { PersonAccountService } from '../../../../../service/person/account.service';
import { AccountTypes } from '../../../../../enum/person/account-type.enum';
import { Currencies } from '../../../../../enum/person/currencies.enum';
import { expandCollapse } from '../../../../../stc';

@Component({
    selector: 'fiche-money-one',
    templateUrl: './one.comp.html',
    animations: [expandCollapse]
})
export class FicheMoneyOneComp implements OnInit, OnDestroy {
    host: FicheCrudComp;

    debtAccountCmbBo: PersonAccountCmbBo[];
    creditAccountCmbBo: PersonAccountCmbBo[];

    subsNeedRefresh: Subscription;

    accountTypes = AccountTypes;
    stats = Stats;
    currencies = Currencies;

    config: CurrencyMaskConfig;

    busy: boolean = false;
    constructor(
        @Host() host: FicheCrudComp,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private dialogService: DialogService,
        private personAccountService: PersonAccountService,
        private utils: UtilService) {
        this.host = host;

        this.debtAccountCmbBo = [];
        this.creditAccountCmbBo = [];

        const ficheMoneyDto = new FicheMoneyDto();
        ficheMoneyDto.CurrencyId = this.host.ficheDto.CurrencyId;

        this.config = this.utils.getCurrencyMaskOptions(this.host.ficheDto.CurrencyId);

        this.host.ficheDto.MoneyList = [];
        this.host.ficheDto.MoneyList.push(ficheMoneyDto);

        this.handleAccounts();
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'FicheRelationChanged') {
                    this.host.ficheDto.MoneyList[0].Total = this.host.relatedRemainingTotal;
                    this.changeCalculation();
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    getPersonAccounts(personId: number): Observable<PersonAccountCmbBo[]> {
        const _eventBus: Subject<PersonAccountCmbBo[]> = new Subject<PersonAccountCmbBo[]>();

        let accountCmbBo: PersonAccountCmbBo[] = [];

        let criteriaDto: PersonAccountGetListCriteriaDto;
        criteriaDto = new PersonAccountGetListCriteriaDto();
        criteriaDto.StatId = Stats.xActive;
        criteriaDto.CurrencyId = this.host.ficheDto.CurrencyId;

        criteriaDto.OwnerPersonId = personId;

        let subs = this.personAccountService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
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
                this.logExService.saveObservableEx(err, this.constructor.name, 'getPersonAccounts', subs);
                this.busy = false;

                _eventBus.next(null);
            }
        );

        return _eventBus.asObservable();
    }

    handleAccounts(): void {
        if (this.host.otherPersonRelation.RelatedPersonId == null) {
            this.dialogService.show({
                text: 'Lütfen bir tane bağlantı seçiniz.',
                icon: DialogIcons.Warning,
                buttons: DialogButtons.OK,
                closeIconVisible: true
            });

            return;
        }

        let subscribeGetAccountsDebt = this.getPersonAccounts(this.host.ficheDto.DebtPersonId).subscribe(
            x => {
                this.utils.unsubs(subscribeGetAccountsDebt);
                this.debtAccountCmbBo = x;

                let subscribeGetAccountsCredit = this.getPersonAccounts(this.host.ficheDto.CreditPersonId).subscribe(
                    x => {
                        this.utils.unsubs(subscribeGetAccountsCredit);
                        this.creditAccountCmbBo = x;

                        if ((this.host.ficheDto.IsDebtMaster && (this.utils.isNull(this.debtAccountCmbBo) || this.debtAccountCmbBo.length == 0))
                            || (this.host.ficheDto.IsCreditMaster && (this.utils.isNull(this.creditAccountCmbBo) || this.creditAccountCmbBo.length == 0))) {
                            this.dialogService.show({
                                text: 'Seçtiğiniz profilin(' + this.host.profile.FullName + ') kriterlere uygun hiç para hesabı yok.',
                                icon: DialogIcons.Question,
                                buttons: DialogButtons.OK,
                                closeIconVisible: true
                            });
                        } else {
                            if (this.host.isDebt && this.utils.isNotNull(this.debtAccountCmbBo)) {
                                const debtCashAccounts = this.debtAccountCmbBo.find(x => x.accountTypeId == AccountTypes.xCash);

                                if (this.utils.isNotNull(debtCashAccounts) && debtCashAccounts.accountList.length == 1) {
                                    this.host.ficheDto.MoneyList[0].DebtPersonAccountId = debtCashAccounts.accountList[0].Id;

                                    this.changeAccount();

                                    this.host.ficheDto.MoneyList[0].CreditPersonAccountTypeId = AccountTypes.xCash;
                                }
                            }
                            if (!this.host.isDebt && this.utils.isNotNull(this.creditAccountCmbBo)) {
                                const creditCashAccounts = this.creditAccountCmbBo.find(x => x.accountTypeId == AccountTypes.xCash);

                                if (this.utils.isNotNull(creditCashAccounts) && creditCashAccounts.accountList.length == 1) {
                                    this.host.ficheDto.MoneyList[0].CreditPersonAccountId = creditCashAccounts.accountList[0].Id;

                                    this.changeAccount();

                                    this.host.ficheDto.MoneyList[0].DebtPersonAccountTypeId = AccountTypes.xCash;
                                }
                            }
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

    currencyChanged(): void {
        this.handleAccounts();
    }

    changeCalculation(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheCalculation');
    }

    changeAccount(): void {
        this.host.ficheDto.MoneyList[0].DebtPersonAccountTypeId = this.getAccountTypeId(this.debtAccountCmbBo, this.host.ficheDto.MoneyList[0].DebtPersonAccountId);
        this.host.ficheDto.MoneyList[0].CreditPersonAccountTypeId = this.getAccountTypeId(this.creditAccountCmbBo, this.host.ficheDto.MoneyList[0].CreditPersonAccountId);
    }

    getAccountTypeId(cmb: PersonAccountCmbBo[], accountId: number): AccountTypes {
        if (this.utils.isNull(cmb) || cmb.length == 0) return;

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