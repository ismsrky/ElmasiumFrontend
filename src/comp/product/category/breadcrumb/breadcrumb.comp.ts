import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { ProductCategoryService } from '../../../../service/product/category.service';
import { PersonProductService } from '../../../../service/person/product.service';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { ProductCategoryGetListCriteriaDto } from '../../../../dto/product/category/getlist-criteria.dto';
import { ProductCategoryListDto } from '../../../../dto/product/category/list.dto';
import { PersonProductUpdateDto } from '../../../../dto/person/product/update.dto';
import { PersonProductProfileDto } from '../../../../dto/person/product/profile.dto';
import { PropertyGetListCriteriaDto } from '../../../../dto/property/getlist-criteria.dto';

// Bo

// Enum
import { ProductUpdateTypes } from '../../../../enum/product/update-types.enum';
import { PropertyService } from '../../../../service/property/property.service';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'product-category-breadcrumb',
    templateUrl: './breadcrumb.comp.html',
    animations: [expandCollapse]
})
export class ProductCategoryBreadcrumbComp implements OnInit, OnDestroy {
    upperCategoryListDto: ProductCategoryListDto[];

    @Input('personProductProfileDto') personProductProfileDto: PersonProductProfileDto;

    editCategoryListDto: ProductCategoryListDto[];
    isEdit: boolean = false;
    lastCategoryId: number;
    showSaveBtn: boolean = false;

    selectedCategoryId: number;

    selectedCategory: ProductCategoryListDto = null;

    childrenCategoryListDto: ProductCategoryListDto[];

    busy: boolean = false;
    busyChildren: boolean = false;
    constructor(
        private productCategoryService: ProductCategoryService,
        private personProductService: PersonProductService,
        private propertyService: PropertyService,
        private toastr: ToastrService,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.upperCategoryListDto = [];
        this.editCategoryListDto = [];
        this.childrenCategoryListDto = [];
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    setCategoryId(productCategoryId: number): void {
        this.busy = true;

        this.selectedCategoryId = productCategoryId;

        const criteriaDto = new ProductCategoryGetListCriteriaDto();
        criteriaDto.ProductCategoryId = this.selectedCategoryId;
        criteriaDto.IsUpper = true;
        let subs = this.productCategoryService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.upperCategoryListDto = [];
                    this.editCategoryListDto = [];

                    let i: number = 0;
                    let fullUrl: string = '';
                    x.Dto.forEach(element => {
                        i++;
                        fullUrl += '/' + element.UrlName;

                        element.FullUrl = fullUrl;

                        if (this.isEdit) {
                            this.editCategoryListDto.push(element);
                        } else {
                            this.upperCategoryListDto.push(element);
                        }

                        if (i == x.Dto.length) {
                            if (this.isEdit) {
                                this.selectedCategory = this.editCategoryListDto[this.editCategoryListDto.length - 1];
                            } else {
                                this.selectedCategory = this.upperCategoryListDto[this.upperCategoryListDto.length - 1];
                            }
                            this.selectedCategory.IsSelected = true;

                            if (!this.isEdit) {
                                this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({
                                    'selectedCategoryChanged':
                                        { 'selectedCategory': this.selectedCategory }
                                }));

                                this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({
                                    'ProductCategoryUpperListChanged':
                                        { 'upperCategoryListDto': this.upperCategoryListDto }
                                }));
                            }
                        }
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'setCategoryId', subs);
                this.busy = false;
            }
        );
    }

    getChildrenList(category: ProductCategoryListDto): void {
        this.childrenCategoryListDto = [];

        if (category.IsLast) {
            this.editCategoryListDto.forEach(element => {
                element.IsOpen = false;
            });
            return;
        }

        this.lastCategoryId = category.Id;

        const criteriaDto = new ProductCategoryGetListCriteriaDto();
        criteriaDto.ProductCategoryId = category.Id;
        criteriaDto.IsUpper = false;
        this.busyChildren = true;
        let subs = this.productCategoryService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyChildren = false;

                if (x.IsSuccess) {
                    this.childrenCategoryListDto = x.Dto;

                    this.editCategoryListDto.forEach(element => {
                        element.IsOpen = element.Id == category.Id;
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getChildrenList', subs);
                this.busyChildren = false;
            }
        );
    }

    childrenClick(category: ProductCategoryListDto): void {
        const i = this.editCategoryListDto.findIndex(f => f.Id == this.lastCategoryId);

        this.editCategoryListDto.splice(i + 1, this.editCategoryListDto.length - i);

        this.editCategoryListDto.push(category);

        this.showSaveBtn = category.IsLast;

        this.getChildrenList(category);
    }

    save(): void {
        this.busy = true;

        const updateDto = new PersonProductUpdateDto();
        updateDto.PersonProductId = this.personProductProfileDto.PersonProductId;

        updateDto.ProductUpdateTypeList = [];
        updateDto.ProductUpdateTypeList.push(ProductUpdateTypes.xCategory);
        updateDto.CategoryId = this.editCategoryListDto[this.editCategoryListDto.length - 1].Id;
        let subs = this.personProductService.update(updateDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.selectedCategoryId = updateDto.CategoryId;
                    this.isEdit = false;
                    this.setCategoryId(this.selectedCategoryId);

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
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
        this.isEdit = false;
        this.setCategoryId(this.selectedCategoryId);
    }

    edit(): void {
        this.busy = true;

        const criteriaDto = new PropertyGetListCriteriaDto();
        criteriaDto.CaseId = 1;
        criteriaDto.PersonProductId = this.personProductProfileDto.PersonProductId;
        let subs = this.propertyService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        this.dialogService.show({
                            text: this.dicService.getValue('xConfirmUpdatePersonProductCategory')
                                + '<br>'
                                + this.dicService.getValue('xDoYouWantContinue'),
                            icon: DialogIcons.None,
                            buttons: DialogButtons.YesNo,
                            closeIconVisible: true,
                            yes: () => {
                                this.editSub();
                            }
                        });
                    } else {
                        this.editSub();
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'edit', subs);
                this.busy = false;
            }
        );
    }
    private editSub(): void {
        this.isEdit = true;
        this.setCategoryId(this.selectedCategoryId);
    }
}