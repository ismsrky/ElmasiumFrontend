import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Comp
import { PersonSettingShopOrderWorkingHoursComp } from '../working-hour/working-hours.comp';
import { PersonSettingShopOrderAreaListIndexComp } from '../area/list/index.comp';

// Service
import { PersonRelationService } from '../../../../../../service/person/relation.service';
import { ShopPersonService } from '../../../../../../service/person/shop.service';
import { DictionaryService } from '../../../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../../../service/log/exception.service';
import { UtilService } from '../../../../../../service/sys/util.service';

// Dto
import { ShopOrderGeneralDto } from '../../../../../../dto/person/shop/order-general.dto';
import { ShopOrderGeneralGetCriteriaDto } from '../../../../../../dto/person/shop/order-general-get-criteria.dto';

// Enum
import { RelationTypes } from '../../../../../../enum/person/relation-types.enum';
import { AccountTypes } from '../../../../../../enum/person/account-type.enum';
import { CompBroadCastTypes } from '../../../../../../enum/sys/comp-broadcast-types.enum';
import { Currencies } from '../../../../../../enum/person/currencies.enum';

@Component({
    selector: 'person-setting-shop-order-general',
    templateUrl: './general.comp.html'
})
export class PersonSettingShopOrderGeneralComp implements OnInit, OnDestroy {
    orderGeneralDto: ShopOrderGeneralDto;
    shopId: number;

    @ViewChild(PersonSettingShopOrderWorkingHoursComp, { static: false }) settingShopOrderComp: PersonSettingShopOrderWorkingHoursComp;
    @ViewChild(PersonSettingShopOrderAreaListIndexComp, { static: false }) settingShopOrderListComp: PersonSettingShopOrderAreaListIndexComp;

    @ViewChild('shopOrderGeneralForm', { static: false }) shopOrderGeneralForm: NgForm;

    accountTypeList = [];
    currencyList = [];

    busy: boolean = false;
    constructor(
        private shopPersonService: ShopPersonService,
        private personRelationService: PersonRelationService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        for (var enumMember in AccountTypes) {
            if (!isNaN(parseInt(enumMember, 10))) {
                this.accountTypeList.push({
                    key: parseInt(enumMember, 10),
                    value: this.dicService.getValue(AccountTypes[enumMember])
                });
            }
        }

        for (var enumMember in Currencies) {
            if (!isNaN(parseInt(enumMember, 10))) {
                this.currencyList.push({
                    key: parseInt(enumMember, 10),
                    value: this.dicService.getValue(Currencies[enumMember])
                });
            }
        }

        this.orderGeneralDto = new ShopOrderGeneralDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    loadData(shopId: number): void {
        this.shopId = shopId;

        const criteriaDto = new ShopOrderGeneralGetCriteriaDto();
        criteriaDto.PersonId = this.shopId;
        this.busy = true;
        let subs = this.shopPersonService.getOrderGeneral(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.orderGeneralDto = x.Dto;

                    this.settingShopOrderComp.loadData(this.shopId);
                    this.settingShopOrderListComp.loadData(this.shopId);
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

    checkSave(): boolean {
        if (!this.personRelationService.hasRelationIn(RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
            return false;
        }
        if (this.orderGeneralDto.TakesOrder
            && (this.utils.isNull(this.orderGeneralDto.OrderAccountList) || this.orderGeneralDto.OrderAccountList.length <= 0)) {
            this.dialogService.showError(this.dicService.getValue('xEnterAllForOrder'));
            return false;
        }
        //this.dialogService.showError(this.dicService.getValue('xEnterAllForOrder'));
        return true;
    }

    save(): void {
        if (!this.checkSave()) return;

        if (this.shopOrderGeneralForm.invalid) {
            return;
        }
        if (this.shopOrderGeneralForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        this.busy = true;
        this.orderGeneralDto.PersonId = this.shopId;
        let subs = this.shopPersonService.updateOrderGeneral(this.orderGeneralDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                
                if (x.IsSuccess) {
                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, 'PersonSettingShopOrderGeneralComp');

                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));
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