import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { FicheService } from '../../../service/fiche/fiche.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { FicheDto } from '../../../dto/fiche/fiche.dto';
import { FicheGetCriteriaDto } from '../../../dto/fiche/get-criteria.dto';
import { FicheListDto } from '../../../dto/fiche/list.dto';
import { PersonRelationListDto } from '../../../dto/person/relation/list.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { FicheTypes } from '../../../enum/fiche/types.enum';
import { FicheContents } from '../../../enum/fiche/contents.enum';
import { FicheTypeFakes } from '../../../enum/fiche/type-fakes.enum';

@Component({
    selector: 'fiche-crud',
    templateUrl: './crud.comp.html'
})
export class FicheCrudComp implements OnInit, OnDestroy {
    isDebt: boolean; // This means if the my such person is debt or credit.
    // this variable also determines if direction of this fiche is sale/purchase, sender/receiver.
    // this variable is useless if 'IsAmongMyPersons' is checked.

    profile: PersonProfileBo;

    otherPersonRelation: PersonRelationListDto;
    otherPersonCaptionStr: string = '';
    headerCaptionStr: string = '';

    config: CurrencyMaskConfig;

    ficheDto: FicheDto;
    isNew: boolean = true;

    isFixed: boolean = false;

    busy: boolean = false;

    xSave: string = 'xSave';

    ficheTypeFakeId: FicheTypeFakes;
    ficheTypes = FicheTypes;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    subsNeedRefresh: Subscription;

    relatedFicheListDto: FicheListDto[];
    relatedRemainingTotal: number;
    constructor(
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private ficheService: FicheService,
        private localStorageService: LocalStorageService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;

        this.ficheDto = new FicheDto(this.utils);

        this.ficheDto.CurrencyId = this.profile.SelectedCurrencyId;

        this.config = this.utils.getCurrencyMaskOptions(this.ficheDto.CurrencyId);

        this.otherPersonRelation = new PersonRelationListDto(this.dicService);
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'FicheCalculation') {
                    this.ficheService.calculateTotals(this.ficheDto);
                } else if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                    this.cancel();
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    save(): void {
        this.ficheService.calculateTotals(this.ficheDto);

        // TODO: add a subscription here instead of setTimeout later.
        setTimeout(() => {
            this.profile = this.localStorageService.personProfile;

            if (!this.checkRelationSave()) return;
            if (!this.checkMoneySave()) return;
            if (!this.checkDebtCreditSave()) return;

            this.busy = true;
            this.ficheDto.IssueDateNumber = this.utils.getDateNumber(this.ficheDto.IssueDate);
            this.ficheDto.DueDateNumber = this.utils.getDateNumber(this.ficheDto.DueDate);
            let subs = this.ficheService.save(this.ficheDto).subscribe(
                x => {
                    this.utils.unsubs(subs);
                this.busy = false;

                    if (x.IsSuccess) {
                        this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));

                        if (this.isFixed) {
                            this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh,
                                JSON.stringify({ 'FicheCrudFixed': this.otherPersonRelation.Id }));
                        }

                        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'FicheCrudComp');
                    } else {
                        this.dialogService.showError(x.Message);
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;
                }
            );
        }, 200);
    }
    cancel(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'FicheCrudComp');
    }

    // If you show as belows, you cannot change parties and user will not see parties.
    showAsFixed(otherPerson: PersonRelationListDto, ficheId: number, ficheTypeFakeId: FicheTypeFakes, ficheContentId: FicheContents): void {
        this.isFixed = true;
        this.otherPersonRelation = otherPerson;

        this.show(ficheId, ficheTypeFakeId, ficheContentId);
    }

    handleOtherPerson(): void {
        if (this.isDebt) {
            this.ficheDto.CreditPersonId = this.otherPersonRelation.RelatedPersonId;
            this.ficheDto.IsCreditMaster = this.otherPersonRelation.IsMaster;

            this.ficheDto.IsDebtMaster = true;
        } else {
            this.ficheDto.DebtPersonId = this.otherPersonRelation.RelatedPersonId;
            this.ficheDto.IsDebtMaster = this.otherPersonRelation.IsMaster;

            this.ficheDto.IsCreditMaster = true;
        }

        if (this.otherPersonRelation.IsMaster) {
            this.ficheDto.AcceptorPersonId = null;
        } else {
            this.ficheDto.AcceptorPersonId = this.otherPersonRelation.RelatedPersonId;
        }

        if (this.otherPersonRelation.IsAlone) {
            this.xSave = 'xSave';
        } else {
            this.xSave = this.utils.isNull(this.ficheDto.AcceptorPersonId) ? 'xSave' : 'xSend';
        }
    }

    show(ficheId: number, ficheTypeFakeId: FicheTypeFakes, ficheContentId: FicheContents): void {
        this.ficheTypeFakeId = ficheTypeFakeId;
        this.ficheDto.FicheTypeId = this.ficheService.getFicheTypeId(ficheTypeFakeId);
        this.isDebt = this.ficheService.isDebt(ficheTypeFakeId);
        this.headerCaptionStr = this.ficheService.getFicheCaption(this.ficheDto.FicheTypeId, this.ficheTypeFakeId);

        if (this.isDebt) {
            this.ficheDto.DebtPersonId = this.profile.PersonId;
            this.ficheDto.IsDebtMaster = true;
        } else {
            this.ficheDto.CreditPersonId = this.profile.PersonId;
            this.ficheDto.IsCreditMaster = true;
        }

        if (this.isFixed) {
            this.handleOtherPerson();
        }

        this.otherPersonCaptionStr = this.ficheService.getOtherPersonCaption(this.ficheDto.FicheTypeId, this.isDebt);

        this.ficheDto.FicheContentId = ficheContentId;
        this.ficheService.handleFicheContentGroupId(this.ficheDto);

        if (this.utils.isNull(ficheId) || ficheId <= 0) {
            this.isNew = true;
        } else {
            this.getFiche(ficheId);
        }
    }

    getFiche(ficheId:number): void {
        this.busy = true;

        const criteriaDto = new FicheGetCriteriaDto();
        criteriaDto.MyPersonId = this.profile.PersonId;
        criteriaDto.FicheId = ficheId;

        let subs = this.ficheService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.ficheDto = x.Dto;

                    //this.operantPersonChanged(x.Dto.)
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getFiche', subs);
                this.busy = false;
            }
        );
    }

    checkRelationSave(): boolean {
        if (this.ficheDto.FicheTypeId != FicheTypes.xPayment) return true;

        if (this.relatedFicheListDto.length == 0) {
            this.toastr.warning('Lütfen en 1 tane fatura/fiş seçiniz.');
            return false;
        }

        if (this.ficheDto.GrandTotal != this.relatedRemainingTotal) {
            this.toastr.warning('Ödenen tutar faturaların/fişlerin toplamından farklı olamaz.');
            return false;
        }
        return true;
    }
    checkMoneySave(): boolean {
        if (this.ficheDto.FicheTypeId != FicheTypes.xPayment && this.ficheDto.FicheTypeId != this.ficheTypes.xMoneyTransfer) return true;

        if (this.utils.isNull(this.ficheDto.MoneyList) || this.ficheDto.MoneyList.length == 0) {
            this.toastr.warning(this.dicService.getValue('xInvalidOperation'));
            return false;
        }

        const money = this.ficheDto.MoneyList[0];
        if (money.Total <= 0) {
            this.toastr.warning('Lütfen 0"dan büyük bir tutar giriniz.');
            return false;
        }
        if (this.ficheDto.IsDebtMaster && this.utils.isNull(money.DebtPersonAccountId)) {
            return false;
        }
        if (this.ficheDto.IsCreditMaster && this.utils.isNull(money.CreditPersonAccountId)) {
            return false;
        }
        if (this.utils.isNull(money.DebtPersonAccountTypeId) || this.utils.isNull(money.CreditPersonAccountTypeId)) {
            return false;
        }

        return true;
    }
    checkDebtCreditSave(): boolean {
        if (this.ficheDto.FicheTypeId != FicheTypes.xDebtCredit) return true;

        if (this.utils.isNull(this.ficheDto.GrandTotal) || this.ficheDto.GrandTotal <= 0) {
            this.toastr.warning('Lütfen 0"dan büyük bir tutar giriniz.');
            return false;
        }

        return true;
    }

    changeCalculation(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'FicheCalculation');
    }
}