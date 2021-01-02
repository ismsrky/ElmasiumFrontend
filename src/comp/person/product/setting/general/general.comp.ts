import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Service
import { PersonProductService } from '../../../../../service/person/product.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonProductGeneralGetCriteriaDto } from '../../../../../dto/person/product/general-get-criteria.dto';
import { PersonProductGeneralDto } from '../../../../../dto/person/product/general.dto';
import { PersonProductUpdateDto } from '../../../../../dto/person/product/update.dto';
import { PersonProductDeleteDto } from '../../../../../dto/person/product/delete.dto';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { ProductUpdateTypes } from '../../../../../enum/product/update-types.enum';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { DialogIcons } from '../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../enum/sys/dialog/dialog-buttons.enum';
import { expandCollapse } from '../../../../../stc';

@Component({
    selector: 'person-product-setting-general',
    templateUrl: './general.comp.html',
    animations: [expandCollapse]
})
export class PersonProductSettingGeneralComp implements OnInit, OnDestroy {
    generalDto: PersonProductGeneralDto;

    personProductId: number;

    @ViewChild('generalShopForm', { static: false }) generalShopForm: NgForm;

    @Input('isInside') isInside: boolean = false;

    configCurrency: CurrencyMaskConfig;
    configPercentage: CurrencyMaskConfig;

    loaded: boolean = false;
    busy: boolean = false;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private personProductService: PersonProductService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.generalDto = new PersonProductGeneralDto();

        this.configPercentage = this.utils.getPercentageMaskOptions();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    loadData(personProductId: number): void {
        this.personProductId = personProductId;

        const criteriaDto = new PersonProductGeneralGetCriteriaDto();
        criteriaDto.PersonProductId = personProductId;

        this.busy = true;
        let subs = this.personProductService.getGeneral(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.generalDto = x.Dto;

                    this.loaded = true;

                    this.configCurrency = this.utils.getCurrencyMaskOptions(x.Dto.DefaultCurrencyId);
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

    save(): void {
        if (this.generalShopForm.invalid) {
            return;
        }
        if (this.generalShopForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        this.busy = true;

        const updateDto = new PersonProductUpdateDto();
        updateDto.PersonProductId = this.personProductId;

        updateDto.ProductUpdateTypeList = [];
        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xPurchaseVatRate);
        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xSaleVatRate);

        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xPurhasePrice);
        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xSalePrice);
        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xOnlineSalePrice);

        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xTemporarilyUnavaible);
        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xSaleForOnline);
        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xNotes);

        // Yes, they are both same for now.
        updateDto.PurchaseVatRate = this.generalDto.SaleVatRate;
        updateDto.SaleVatRate = this.generalDto.SaleVatRate;

        updateDto.PurhasePrice = this.generalDto.PurhasePrice;
        updateDto.SalePrice = this.generalDto.SalePrice;
        updateDto.OnlineSalePrice = this.generalDto.OnlineSalePrice;

        updateDto.IsTemporarilyUnavaible = this.generalDto.IsTemporarilyUnavaible;
        updateDto.IsSaleForOnline = this.generalDto.IsSaleForOnline;
        updateDto.Notes = this.generalDto.Notes;

        let subs = this.personProductService.update(updateDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({
                        'PersonProductSettingGeneralComp': {
                            'personProductId': this.personProductId
                        }
                    }));
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
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, JSON.stringify({
            'PersonProductSettingGeneralComp': {
                'personProductId': this.personProductId
            }
        }));
    }

    delete(): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.busy = true;
                const deleteDto = new PersonProductDeleteDto();
                deleteDto.Id = this.personProductId;
                let subs = this.personProductService.delete(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.compBroadCastService.sendMessage(CompBroadCastTypes.Deleted, JSON.stringify({
                                'PersonProductSettingGeneralComp': {
                                    'personProductId': this.personProductId
                                }
                            }));
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'delete', subs);
                this.busy = false;
                    }
                );
            }
        });
    }
}