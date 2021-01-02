import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NodeItem, TreeMode, TreeNgxComponent, NodeState } from '../../../../app/tree-ngx';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { ProductCategoryService } from '../../../../service/product/category.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { ProductCategoryRawListDto } from '../../../../dto/product/category/raw-list.dto';
import { ProductCategoryListDto } from '../../../../dto/product/category/list.dto';
import { ProductCategoryGetListAdminCriteriaDto } from '../../../../dto/product/category/getlist-admin-criteria.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';
import { expandCollapseHidden, expandCollapse } from '../../../../stc';

@Component({
    selector: 'product-category-search',
    templateUrl: './search.comp.html',
    animations: [expandCollapseHidden, expandCollapse]
})
export class ProductCategorySearchComp implements OnInit, OnDestroy {
    productCategoryRawList: ProductCategoryRawListDto[];

    nameStr: string = '';

    selectedCategoryId: number;
    upperCategoryRawList: ProductCategoryRawListDto[];

    productId: number;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;
    @ViewChild(TreeNgxComponent, { static: false }) tree: TreeNgxComponent;

    productCategoryDto: ProductCategoryRawListDto;
    showNewProductCategory: boolean = false;

    nodeItems: NodeItem<ProductCategoryListDto>[] = [];
    selectedItems: ProductCategoryListDto[];
    options = {
        mode: TreeMode.SingleSelect,
        checkboxes: false,
        alwaysEmitSelected: true
    };

    busy: boolean = false;
    constructor(
        private productCategoryService: ProductCategoryService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private dicService: DictionaryService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.expandedList = [];
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(selectedCategoryId: number, upperCategoryRawList: ProductCategoryRawListDto[], productId: number) {
        this.selectedCategoryId = selectedCategoryId;
        this.upperCategoryRawList = upperCategoryRawList;
        this.productId = productId;

        this.getCategories();

        this.modal.onHide.subscribe(
            x => {
                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'ProductCategorySearchComp');
            }
        );

        this.modal.show();
    }

    selectChange(selectedList: ProductCategoryListDto[]): void {
        this.selectedItems = selectedList;
    }
    editItem(nodeItem: NodeItem<ProductCategoryListDto>) {
        this.editProductCategory(false, nodeItem);
    }
    newItem(nodeItem: NodeItem<ProductCategoryListDto>) {
        this.editProductCategory(true, nodeItem);
    }
    deleteItem(nodeItem: NodeItem<ProductCategoryListDto>) {
        this.showNewProductCategory = false;

        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete') + ' ' + '"' + nodeItem.name + '"',
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.delete(nodeItem.item.Id);
            }
        });
    }

    getCategories(): void {
        const criteriaDto = new ProductCategoryGetListAdminCriteriaDto();
        criteriaDto.ParentId = null;
        let subs = this.productCategoryService.getRawList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.productCategoryRawList = x.Dto;

                    this.nodeItems = this.convertNodes(this.productCategoryService.convertFromRaw(0, this.productCategoryRawList));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getCategories', subs);
            }
        );
    }

    select(): void {
        if (this.utils.isNull(this.selectedItems) || this.selectedItems.length == 0) {
            this.toastr.warning(this.dicService.getValue('xSelectCategory'));
            return;
        }

        const productCategoryId = this.selectedItems[0].Id;

        this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({
            'ProductCategorySaved': {
                'productId': this.productId,
                'productCategoryId': productCategoryId
            }
        }));

        this.modal.hide();
    }
    cancel(): void {
        this.showNewProductCategory = false;
    }

    convertNodes(item: ProductCategoryListDto[]): NodeItem<ProductCategoryListDto>[] {
        let result: NodeItem<ProductCategoryListDto>[] = [];

        let itemmm: NodeItem<ProductCategoryListDto>;
        item.forEach(element => {
            itemmm = {} as NodeItem<ProductCategoryListDto>;
            itemmm.id = element.Id.toString();
            itemmm.name = this.dicService.getValue(element.Name);

            // itemmm.expanded = this.utils.isNull(this.upperCategoryRawList) ? false : this.utils.isNotNull(this.upperCategoryRawList.find(f => f.Id == element.Id));
            itemmm.expanded = this.utils.isNotNull(this.expandedList.find(f => f == element.Id));
            itemmm.selected = element.Id == this.selectedCategoryId;

            itemmm.item = element;

            if (this.utils.isNotNull(element.SubCategoryList) && element.SubCategoryList.length > 0) {
                itemmm.children = this.convertNodes(element.SubCategoryList);
            }

            result.push(itemmm);
        });

        return result;
    }

    isNew: boolean = false;
    parentName: string = null;
    editProductCategory(isNew: boolean, nodeItem: NodeItem<ProductCategoryListDto>): void {
        setTimeout(() => {
            this.showNewProductCategory = false;

            setTimeout(() => {
                this.showNewProductCategory = true;

                this.isNew = isNew;
                let productCategoryId: number = 0;

                this.parentName = this.isNew ? this.utils.isNull(nodeItem) ? 'Ana kategori' : nodeItem.name : null;

                this.productCategoryDto = new ProductCategoryRawListDto();

                if (isNew) {
                    this.productCategoryDto.ParentId = this.utils.isNull(nodeItem) ? 0 : nodeItem.item.Id;
                } else {
                    // Note: service will only update the name.
                    productCategoryId = nodeItem.item.Id;
                    this.productCategoryDto.Name = this.dicService.getValue(nodeItem.item.Name);
                }

                this.productCategoryDto.Id = isNew ? 0 : productCategoryId;
            });
        });
    }

    expandedList: number[];

    handleExpanded(nodeItems: NodeState[]): void {
        //this.tree.treeService.treeState
        nodeItems.forEach(element => {
            if (element.expanded) {
                this.expandedList.push(element.nodeItem.item.Id);
            }

            if (element.children && element.children.length > 0) {
                this.handleExpanded(element.children);
            }
        });
    }
    save(): void {
        this.busy = true;
        let subs = this.productCategoryService.save(this.productCategoryDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                this.showNewProductCategory = false;

                if (x.IsSuccess) {
                    this.expandedList = [];
                    this.handleExpanded(this.tree.treeService.treeState);

                    this.getCategories();

                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;

                this.showNewProductCategory = false;
            }
        );
    }
    delete(id: number): void {
        this.busy = true;
        let subs = this.productCategoryService.delete(id).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.getCategories();

                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));
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


    select2(): void {
        console.log('select2');
    }
    callbacks(): void {
        console.log('callbacks');
    }
}