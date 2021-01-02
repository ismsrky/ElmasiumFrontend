import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

//Comp

// Service
import { ProductService } from '../../../service/product/product.service';
import { BasketProductService } from '../../../service/basket/product.service';
import { BasketService } from '../../../service/basket/basket.service';
import { OrderService } from '../../../service/order/order.service';
import { AuthService } from '../../../service/auth/auth.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { BasketListDto } from '../../../dto/basket/list.dto';
import { BasketGetListCriteriaDto } from '../../../dto/basket/getlist-criteria.dto';
import { BasketDeleteDto } from '../../../dto/basket/delete.dto';
import { BasketProductListDto } from '../../../dto/basket/product/list.dto';
import { BasketProductDeleteDto } from '../../../dto/basket/product/delete.dto';
import { BasketProductQuantityUpdateDto } from '../../../dto/basket/product/quantity-update.dto';
import { BasketProductOptionUpdateDto } from '../../../dto/basket/product/option-update.dto';
import { BasketProductIncludeExcludeUpdateDto } from '../../../dto/basket/product/include-exclude-option-update.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'basket-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class BasketListIndexComp implements OnInit, OnDestroy {
    basketList: BasketListDto[];

    criteriaDto: BasketGetListCriteriaDto;

    profile: PersonProfileBo;
    subsNeedRefresh: Subscription;

    busy: boolean = false;

    @Input('isReadonly') isReadonly: boolean = false;

    basketId: number;
    constructor(
        private basketService: BasketService,
        private basketProductService: BasketProductService,
        private productService: ProductService,
        private orderService: OrderService,
        private authService: AuthService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private compBroadCastService: CompBroadCastService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private dialogService: DialogService) {
        this.profile = this.localStorageService.personProfile;

        this.basketList = [];
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;

                    this.loadData();
                }
            }
        );

        if (!this.isReadonly) {
            this.loadData();
        }
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    loadData(): void {
        this.busy = true;

        this.criteriaDto = new BasketGetListCriteriaDto();
        this.criteriaDto.DebtPersonId = this.profile.PersonId;
        this.criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        this.criteriaDto.BasketId = this.basketId;
        let subs = this.basketService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.basketList = x.Dto;

                    this.basketList.forEach(element => {
                        element.ShopStarAverage = this.utils.calcAverageStar(element.ShopStarSum, element.ShopStarCount);

                        element.ProductList.forEach(subElement => {
                            subElement.StarAverage = this.utils.calcAverageStar(subElement.StarSum, subElement.StarCount);
                        });
                    });
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

    removeItem(id: number): void {
        const ind: number = this.basketList.findIndex(x => x.Id == id);
        this.basketList.splice(ind, 1);
    }

    getProductProfileUrl(listItem: BasketListDto, productDto: BasketProductListDto): string {
        let fullUrl: string = this.productService.getProductProfileUrl(listItem.ShopUrlName, productDto.ProductId, productDto.ProductTypeId);
        return fullUrl;
    }

    quantityChange(quantity: number, productDto: BasketProductListDto): void {
        if (this.isReadonly) return;

        const updateDto = new BasketProductQuantityUpdateDto();
        updateDto.Quantity = quantity;
        updateDto.BasketProductId = productDto.Id;
        this.busy = true;
        let subs = this.basketProductService.updateQuantity(updateDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    //productDto.Quantity
                    this.loadData();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'subscribeUpdateQuantity', subs);
                this.busy = false;
            }
        );
    }

    updateOption(selectedOptionIdList: number[], productDto: BasketProductListDto): void {
        const updateDto = new BasketProductOptionUpdateDto();
        updateDto.BasketProductId = productDto.Id;
        updateDto.OptionIdList = selectedOptionIdList;
        let subs = this.basketProductService.updateOption(updateDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.loadData();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'updateOption', subs);
            }
        );
    }
    updateIncludeExclude(selectedIdList: number[], productDto: BasketProductListDto): void {
        const updateDto = new BasketProductIncludeExcludeUpdateDto();
        updateDto.BasketProductId = productDto.Id;
        updateDto.IncludeExcludeIdList = selectedIdList;
        let subs = this.basketProductService.updateIncludeExclude(updateDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.loadData();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'updateIncludeExclude', subs);
            }
        );
    }

    delete(listItem: BasketListDto): void {
        if (this.isReadonly) return;

        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const deleteDto = new BasketDeleteDto();
                deleteDto.BasketId = listItem.Id;
                this.busy = true;
                let subs = this.basketService.delete(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.loadData();
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

    deleteProduct(basketProductId: number): void {
        if (this.isReadonly) return;

        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const deleteDto = new BasketProductDeleteDto();
                deleteDto.BasketProductId = basketProductId;
                this.busy = true;
                let subs = this.basketProductService.delete(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.loadData();
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'deleteProduct', subs);
                this.busy = false;
                    }
                );
            }
        });
    }

    goToCreateOrder(basketId: number): void {
        if (!this.authService.handleRealLoginRequired()) return;

        this.orderService.goToCreateOrder(basketId);
    }
}