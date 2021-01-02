import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { ProductCategoryService } from '../../../../service/product/category.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { ProductCategoryListDto } from '../../../../dto/product/category/list.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../stc';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';

@Component({
    selector: 'product-filter-category',
    templateUrl: './category.comp.html',
    animations: [expandCollapse]
})
export class ProductFilterCategoryComp implements OnInit, OnDestroy {
    selectedCategoryId: number = null;

    categoryListDto: ProductCategoryListDto[];
    upperCategoryListDto: ProductCategoryListDto[];

    subsNeedRefresh: Subscription;

    profile: PersonProfileBo;

    busy: boolean = false;
    constructor(
        private productCategoryService: ProductCategoryService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;

        this.upperCategoryListDto = [];
        this.categoryListDto = [];
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('selectedCategoryIdChanged')) {
                        const data = JSON.parse(x).selectedCategoryIdChanged;

                        this.selectedCategoryId = data.selectedCategoryId;
                    } else if (x.includes('ProductCategoryUpperListChanged')) {
                        const data = JSON.parse(x).ProductCategoryUpperListChanged;

                        this.upperCategoryListDto = data.upperCategoryListDto;
                    } else if (x.includes('ProductCategoryListChanged')) {
                        const data = JSON.parse(x).ProductCategoryListChanged;

                        this.categoryListDto = data.categoryListDto;
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    fillArray(index: number): Array<number> {
        return Array(index).fill(0);
    }

    categoryPress(categoryDto: ProductCategoryListDto): void {
        if (this.profile.PersonId != 1 && this.profile.PersonId != 11858) return;

        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete') + '' + categoryDto.Name,
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.delete(categoryDto);
            }
        });
    }

    delete(categoryDto: ProductCategoryListDto): void {
        if (this.profile.PersonId != 1 && this.profile.PersonId != 11858) return;

        this.busy = true;
        let subs = this.productCategoryService.delete(categoryDto.Id).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Deleted, 'ProductFilterCategoryComp');

                    this.toastr.success(this.dicService.getValue('xDeletedSuccess'));
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
}