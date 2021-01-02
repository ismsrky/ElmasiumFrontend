import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Service
import { ProductCodeService } from '../../../../service/product/code.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { ProductCodeDto } from '../../../../dto/product/code/code.dto';
import { ProductCodeGetListCriteriaDto } from '../../../../dto/product/code/getlist-criteria.dto';
import { ProductCodeListDto } from '../../../../dto/product/code/list.dto';

// Enum
import { ProductCodeTypes } from '../../../../enum/product/code-types.enum';
import { expandCollapse } from '../../../../stc';
import { LogExceptionService } from '../../../../service/log/exception.service';

@Component({
    selector: 'product-code-list',
    templateUrl: './list.comp.html',
    animations: [expandCollapse]
})
export class ProductCodeListComp implements OnInit, OnDestroy {
    codeList: ProductCodeListDto[];

    criteriaDto: ProductCodeGetListCriteriaDto;

    productCodeDto: ProductCodeDto;

    showNewProductCode: boolean = false;

    @ViewChild('productCodeForm', { static: false }) productCodeForm: NgForm;

    productCodeTypes = ProductCodeTypes;

    busy: boolean = false;
    constructor(
        private productCodeService: ProductCodeService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private dicService: DictionaryService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.codeList = [];
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(productId: number): void {
        this.criteriaDto = new ProductCodeGetListCriteriaDto();
        this.criteriaDto.ProductId = productId;

        this.loadData();
    }

    loadData(): void {
        this.busy = true;
        let subs = this.productCodeService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.codeList = x.Dto;
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
        if (this.productCodeForm.invalid) {
            return;
        }

        this.busy = true;
        this.productCodeDto.ProductId = this.criteriaDto.ProductId;
        this.productCodeDto.ProductCodeTypeId = ProductCodeTypes.xBarcode;
        let subs = this.productCodeService.save(this.productCodeDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.showNewProductCode = false;

                    this.loadData();

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

    newProductCode(): void {
        this.productCodeDto = new ProductCodeDto();
        this.productCodeForm.form.reset();
        this.showNewProductCode = true;
    }

    cancel(): void {
        this.showNewProductCode = false;
    }
}