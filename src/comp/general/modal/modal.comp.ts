import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { CommentCrudComp } from '../../comment/crud/crud.comp';
import { WarningCrudComp } from '../../warning/crud/crud.comp';
import { ProductNewComp } from '../../product/new/new.comp';
import { OrderStatHistoryCrudComp } from '../../order/stat/history/crud/crud.comp';
import { BasketAddComp } from '../../basket/add/add.comp';
import { PersonVerifyPhoneComp } from '../../person/verify-phone/verify-phone.comp';

// Service
import { WarningService } from '../../../service/warning/warning.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { WarningCheckDto } from '../../../dto/warning/check.dto';

// Bo
import { ModalBasketAddBo } from '../../../bo/modal/basket-add.bo';
import { ModalProductNewBo } from '../../../bo/modal/product-new.bo';
import { ModalCommentSaveBo } from '../../../bo/modal/comment-save.bo';
import { ModalOrderStatHistorySaveBo } from '../../../bo/modal/order-stat-history-save.bo';
import { ModalPersonVerifyPhoneBo } from '../../../bo/modal/person-verify-phone.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { WarningModuleTypes } from '../../../enum/warning/module-types.enum';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.comp.html'
})
export class AppModalComp implements OnInit, OnDestroy {
    /**
     * Notes:
     * This comp was written to use some modal comp that used in system more than once.
     * You can put a multiple used modal comp here to avoid duplication.
     * It is good to add those comp here.
     */

    @ViewChild(CommentCrudComp, { static: false }) childCommentCrudComp: CommentCrudComp;
    @ViewChild(WarningCrudComp, { static: false }) childWarningComp: WarningCrudComp;
    @ViewChild(ProductNewComp, { static: false }) childProductNewComp: ProductNewComp;
    @ViewChild(OrderStatHistoryCrudComp, { static: false }) childOrderStatHistoryCrudComp: OrderStatHistoryCrudComp;
    @ViewChild(BasketAddComp, { static: false }) childBasketAddComp: BasketAddComp;
    @ViewChild(PersonVerifyPhoneComp, { static: false }) childPersonVerifyPhoneComp: PersonVerifyPhoneComp;

    isCommentCrudCompOpen: boolean = false;
    isWarningCrudCompOpen: boolean = false;
    isProductNewCompOpen: boolean = false;
    isOrderStatHistoryCrudCompOpen: boolean = false;
    isBasketAddCompOpen: boolean = false;
    isPersonVerifyPhoneComp: boolean = false;

    subsModalClosed: Subscription;
    subsOpen: Subscription;

    busy: boolean = false;

    constructor(
        private warningService: WarningService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
    }

    ngOnInit(): void {
        this.subsOpen = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Open).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('CommentCrudComp')) {
                        const data = JSON.parse(x).CommentCrudComp;

                        this.openComment(data.commentSaveBo);
                    } else if (x.includes('WarningCrudComp')) {
                        const data = JSON.parse(x).WarningCrudComp;

                        this.openWarn(data.warningModuleTypeId, data.refId);
                    } else if (x.includes('ProductNewComp')) {
                        const data = JSON.parse(x).ProductNewComp;

                        this.openNewProduct(data.productNewBo);
                    } else if (x.includes('OrderStatHistoryCrudComp')) {
                        const data = JSON.parse(x).OrderStatHistoryCrudComp;

                        this.openOrderStatHistory(data.statHistorySaveBo);
                    } else if (x.includes('BasketAddComp')) {
                        const data = JSON.parse(x).BasketAddComp;

                        this.openBasketAdd(data.basketAddBo);
                    } else if (x.includes('PersonVerifyPhoneComp')) {
                        const data = JSON.parse(x).PersonVerifyPhoneComp;

                        this.openPersonVerifyPhone(data.personVerifyPhoneBo);
                    }
                }
            }
        );

        this.subsModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'CommentCrudComp') {
                    this.isCommentCrudCompOpen = false;
                } else if (x == 'WarningCrudComp') {
                    this.isWarningCrudCompOpen = false;
                } else if (x == 'ProductNewComp') {
                    this.isProductNewCompOpen = false;
                } else if (x == 'OrderStatHistoryCrudComp') {
                    this.isOrderStatHistoryCrudCompOpen = false;
                } else if (x == 'BasketAddComp') {
                    this.isBasketAddCompOpen = false;
                } else if (x == 'PersonVerifyPhoneComp') {
                    this.isPersonVerifyPhoneComp = false;
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsModalClosed);
        this.utils.unsubs(this.subsOpen);
    }

    openComment(commentSaveBo: ModalCommentSaveBo): void {
        this.isCommentCrudCompOpen = true;

        setTimeout(() => {
            this.childCommentCrudComp.showModal(commentSaveBo);
        }, 200);
    }

    openWarn(warningModuleTypeId: WarningModuleTypes, refId: number): void {
        const saveCheckDto = new WarningCheckDto();
        saveCheckDto.WarningModuleTypeId = warningModuleTypeId;

        switch (warningModuleTypeId) {
            case WarningModuleTypes.PersonProduct:
                saveCheckDto.PersonProductId = refId;
                break;
            case WarningModuleTypes.Comment:
                saveCheckDto.CommentId = refId;
                break;
            case WarningModuleTypes.Person:
                saveCheckDto.PersonId = refId;
                break;
        }

        this.saveCheckWarning(saveCheckDto, refId);
    }

    saveCheckWarning(saveCheckDto: WarningCheckDto, refId: number): void {
        this.busy = true;
        let subs = this.warningService.saveCheck(saveCheckDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.isWarningCrudCompOpen = true;

                    setTimeout(() => {
                        this.childWarningComp.showModal(WarningModuleTypes.Comment, refId);
                    }, 200);
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'saveCheckWarning', subs);
                this.busy = false;
            }
        );
    }

    openNewProduct(productNewBo: ModalProductNewBo): void {
        this.isProductNewCompOpen = true;

        setTimeout(() => {
            this.childProductNewComp.showModal(productNewBo);
        }, 200);
    }

    openOrderStatHistory(statHistorySaveBo: ModalOrderStatHistorySaveBo): void {
        this.isOrderStatHistoryCrudCompOpen = true;

        setTimeout(() => {
            this.childOrderStatHistoryCrudComp.showModal(statHistorySaveBo);
        }, 200);
    }

    openBasketAdd(basketAddBo: ModalBasketAddBo): void {
        this.isBasketAddCompOpen = true;

        setTimeout(() => {
            this.childBasketAddComp.showModal(basketAddBo);
        }, 200);
    }

    openPersonVerifyPhone(personVerifyPhoneBo: ModalPersonVerifyPhoneBo): void {
        this.isPersonVerifyPhoneComp = true;

        setTimeout(() => {
            this.childPersonVerifyPhoneComp.showModal(personVerifyPhoneBo);
        }, 200);
    }
}