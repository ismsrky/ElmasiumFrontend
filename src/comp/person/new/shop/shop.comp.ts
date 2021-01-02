import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { ShopPersonService } from '../../../../service/person/shop.service';
import { EnumsOpService } from '../../../../service/enumsop/enumsop.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { RegisterShopDto } from '../../../../dto/person/shop/register-shop.dto';
import { ShopTypeDto } from '../../../../dto/enumsOp/shop-type.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { Currencies } from '../../../../enum/person/currencies.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-new-shop-crud',
    templateUrl: './shop.comp.html',
    animations: [expandCollapse]
})
export class PersonNewShopCrudComp implements OnInit, OnDestroy {
    registerShopDto: RegisterShopDto;

    @ViewChild('newShopForm', { static: false }) newShopForm: NgForm;
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    busy: boolean = false;

    shopTypeList: ShopTypeDto[];

    currencies = Currencies;
    constructor(
        private shopService: ShopPersonService,
        private enumsOpService: EnumsOpService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private dicService: DictionaryService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.getShopTypeList();
        
        this.registerShopDto = new RegisterShopDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(): void {
        this.registerShopDto = new RegisterShopDto();

        this.modal.onHide.subscribe(
            x => {
                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonNewShopCrudComp');
            }
        );

        this.modal.show();
    }

    getShopTypeList(): void {
        this.shopTypeList = [];
        let subs = this.enumsOpService.getShopTypeList().subscribe(
            x => {
                this.utils.unsubs(subs);

                this.shopTypeList = x.Dto;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getShopTypeList', subs);
            }
        );
    }

    save(): void {
        if (this.newShopForm.invalid) {
            return;
        }

        this.busy = true;
        let subs = this.shopService.register(this.registerShopDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, 'PersonSettingShopOrderAreaCrudComp');

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