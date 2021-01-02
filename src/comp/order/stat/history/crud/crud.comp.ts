import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';

// Service
import { OrderStatHistoryService } from '../../../../../service/order/stat-history.service';
import { ShopPersonService } from '../../../../../service/person/shop.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { OrderStatHistoryDto } from '../../../../../dto/order/stat-history/stat-history.dto';
import { OrderStatHistoryGetCriteriaDto } from '../../../../../dto/order/stat-history/get-criteria.dto';
import { OrderStatListDto } from '../../../../../dto/order/stat-list.dto';
import { ShopOrderAccountListDto } from '../../../../../dto/person/shop/order-account-list.dto';
import { ShopOrderAccountGetListCriteriaDto } from '../../../../../dto/person/shop/order-account-getlist-criteria.dto';

// Bo
import { ModalOrderStatHistorySaveBo } from '../../../../../bo/modal/order-stat-history-save.bo';
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { AccountTypes } from '../../../../../enum/person/account-type.enum';
import { Stc } from '../../../../../stc';

@Component({
    selector: 'order-stat--history-crud',
    templateUrl: './crud.comp.html'
})
export class OrderStatHistoryCrudComp implements OnInit, OnDestroy {
    @ViewChild('statHistoryForm', { static: false }) statHistoryForm: NgForm;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    statHistoryDto: OrderStatHistoryDto;

    statHistorySaveBo: ModalOrderStatHistorySaveBo;

    profile: PersonProfileBo;

    isNew: boolean = false;

    xNotesPlaceHolder: string = '';

    statDto: OrderStatListDto = null;

    accountListDto: ShopOrderAccountListDto[] = null;

    accountTypes = AccountTypes;

    busy: boolean = false;
    constructor(
        private shopPersonService: ShopPersonService,
        private statHistoryService: OrderStatHistoryService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
        this.statHistoryDto = new OrderStatHistoryDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(statHistorySaveBo: ModalOrderStatHistorySaveBo): void {
        this.statHistorySaveBo = statHistorySaveBo;

        if (this.utils.isNull(statHistorySaveBo.Id) || statHistorySaveBo.Id <= 0) {
            this.statDto = Stc.orderStatListDto.find(f => f.Id == statHistorySaveBo.OrderStatId);
            this.getAccountList();
            this.handleNotesPlaceHolder();

            this.isNew = true;
            this.statHistoryDto = new OrderStatHistoryDto();
            this.statHistoryDto.OrderId = statHistorySaveBo.OrderId;
            this.statHistoryDto.PersonId = this.profile.PersonId;
            this.statHistoryDto.OrderStatId = statHistorySaveBo.OrderStatId;
        } else {
            this.isNew = false;
            this.get(statHistorySaveBo.Id);
        }

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'OrderStatHistoryCrudComp');
            }
        );

        this.modal.show();
    }

    save(): void {
        if (!this.isNew) return; // only insert.

        if (this.statHistoryForm.invalid) {
            return;
        }

        this.busy = true;

        let subs = this.statHistoryService.save(this.statHistoryDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.statHistoryDto.Id = x.ReturnedId;

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({ 'OrderStatHistoryCrudComp': this.statHistoryDto }));

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));

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
    cancel(): void {
        this.modal.hide();
    }

    get(id: number): void {
        this.busy = true;
        const criteriaDto = new OrderStatHistoryGetCriteriaDto();
        criteriaDto.Id = id;
        let subs = this.statHistoryService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.utils.isNull(x.Dto)) {
                        this.toastr.warning(this.dicService.getValue('xNoRecordsFound'));
                        this.modal.hide();
                    } else {
                        this.statHistoryDto = x.Dto;

                        this.statDto = Stc.orderStatListDto.find(f => f.Id == this.statHistoryDto.OrderStatId);
                        this.getAccountList();

                        this.handleNotesPlaceHolder();
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'get', subs);
                this.busy = false;
            }
        );
    }

    getAccountList(): void {
        if (this.utils.isNull(this.statDto) || !this.statDto.IsRequireAccountTypeId) return;

        const criteriaDto = new ShopOrderAccountGetListCriteriaDto();
        criteriaDto.PersonId = this.statHistorySaveBo.ShopId;
        let subs = this.shopPersonService.getOrderAccountList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.accountListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getAccountList', subs);
            }
        );
    }

    handleNotesPlaceHolder(): void {
        if (this.statDto.IsRequireNotes) {
            this.xNotesPlaceHolder = this.dicService.getValue('xDescRequired');
        } else {
            this.xNotesPlaceHolder = this.dicService.getValue('xOptional');
        }
    }
}