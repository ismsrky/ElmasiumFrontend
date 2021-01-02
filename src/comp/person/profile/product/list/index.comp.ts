import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { PageTitleComp } from '../../../../general/page-title/page-title.comp';

// Service
import { ProductCategoryService } from '../../../../../service/product/category.service';
import { PersonProductService } from '../../../../../service/person/product.service';
import { BasketProductService } from '../../../../../service/basket/product.service';
import { ProductService } from '../../../../../service/product/product.service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { ProductCategoryGetListCriteriaDto } from '../../../../../dto/product/category/getlist-criteria.dto';
import { PersonProductCategoryGetListCriteriaDto } from '../../../../../dto/person/product/category-getlist-criteria.dto';
import { ProductCategoryListDto } from '../../../../../dto/product/category/list.dto';
import { PersonProfileProductListDto } from '../../../../../dto/person/product/profile-list.dto';
import { PersonProfileProductGetListCriteriaDto } from '../../../../../dto/person/product/profile-getlist-criteria.dto';
import { ShopProfileDto } from '../../../../../dto/person/shop/profile.dto';
import { ProductSaveDto } from '../../../../../dto/product/save.dto';

// Bo
import { ModalBasketAddBo } from '../../../../../bo/modal/basket-add.bo';
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../../stc';
import { ProductTypes } from '../../../../../enum/product/types.enum';
import { StockStats } from '../../../../../enum/product/stock-stats-.enum';

@Component({
    selector: 'person-profile-product-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonProfileProductListIndexComp implements OnInit, OnDestroy {
    categoryListDto: ProductCategoryListDto[];

    shopProfileDto: ShopProfileDto;
    productTypeId: ProductTypes;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;

    profile: PersonProfileBo;

    isSaleForOnline: boolean = null;
    isTemporarilyUnavaible: boolean = null;
    stockStatId: StockStats = null;

    subsNeedRefresh: Subscription;
    subsSaved: Subscription;
    subscriptionDelete: Subscription;

    busy: boolean = false;
    busyCategory: boolean = false;

    isProductOfferOpen: boolean = false;

    searchValue: string = null;

    isNarrow: boolean = false;
    constructor(
        private personProductService: PersonProductService,
        private productService: ProductService,
        private productCategoryService: ProductCategoryService,
        private basketProductService: BasketProductService,
        private compBroadCastService: CompBroadCastService,
        private localStorageService: LocalStorageService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.rootCategoryListDto = [];

        this.profile = this.localStorageService.personProfile;
    }

    ngOnInit(): void {
        this.isNarrow = window.innerWidth <= 768; // md

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                }
                else if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonProfileSearch')) {
                        this.searchValue = JSON.parse(x).PersonProfileSearch.newValue;

                        this.categoryListDto = [];
                        this.getCategoryList();
                    }
                }
            }
        );

        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('ProductNewComp')) {
                        const productSaveDto: ProductSaveDto = JSON.parse(x).ProductNewComp;
                        this.getCategoryList();
                    }
                    if (x.includes('ProductAddedToInventory')) {
                        this.getCategoryList();
                    }
                }
            }
        );

        this.subscriptionDelete = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Deleted).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonProductSettingGeneralComp')) {
                        const personProductId: number = JSON.parse(x).PersonProductSettingGeneralComp.personProductId;
                        this.getCategoryList();
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subsSaved);
        this.utils.unsubs(this.subscriptionDelete);
    }

    show(shopProfileDto: ShopProfileDto, productTypeId: ProductTypes): void {
        this.shopProfileDto = shopProfileDto;
        this.productTypeId = productTypeId;

        this.getCategoryList();
    }

    getCategoryList(): void {
        const criteriaDto = new PersonProductCategoryGetListCriteriaDto();
        criteriaDto.PersonId = this.shopProfileDto.ShopId;
        criteriaDto.ProductTypeId = this.productTypeId;

        criteriaDto.IsSaleForOnline = this.isSaleForOnline;
        criteriaDto.IsTemporarilyUnavaible = this.isTemporarilyUnavaible;

        criteriaDto.ProductNameCode = this.searchValue;

        this.busyCategory = true;
        let subs = this.personProductService.getCategoryList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyCategory = false;

                if (x.IsSuccess) {
                    this.categoryListDto = x.Dto;

                    if (this.categoryListDto && this.categoryListDto.length > 0) {
                        this.categoryListDto.forEach(element => {
                            this.getUpperList(element);
                        });
                    } else {
                        this.rootCategoryListDto = [];
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getCategoryList', subs);
                this.busyCategory = false;
            }
        );
    }

    getProductListRow(listItem: PersonProfileProductListDto): void {
        const criteriaDto = new PersonProfileProductGetListCriteriaDto();
        criteriaDto.PersonProductId = listItem.Id;
        listItem.Busy = true;

        let subs = this.personProductService.getListForProfile(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                listItem.Busy = false;

                if (x.IsSuccess && this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                    this.categoryListDto.forEach(catItem => {
                        if (this.utils.isNotNull(catItem.ProductList) && catItem.ProductList.length > 0) {
                            catItem.ProductList.forEach(productItem => {
                                if (productItem.Id == listItem.Id) {
                                    // Code below did not work:
                                    //productItem = x.Dto[0];

                                    // So, I had to writer this:
                                    let i = this.categoryListDto.find(c => c.Id == catItem.Id).ProductList.findIndex(p => p.Id == listItem.Id);
                                    this.categoryListDto.find(c => c.Id == catItem.Id).ProductList[i] = x.Dto[0];
                                    // Find why it did not work and try to find a better solution.
                                }
                            });
                        }
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getProductListRow', subs);
                listItem.Busy = false;
            }
        );
    }
    getProductList(categoryDto: ProductCategoryListDto): void {
        if (categoryDto.ProductListWaitTill) return;

        categoryDto.ProductListWaitTill = true;

        if (this.utils.isNull(categoryDto.ProductList)) {
            categoryDto.ProductList = [];
        }

        const criteriaDto = new PersonProfileProductGetListCriteriaDto();
        criteriaDto.ShopId = this.shopProfileDto.ShopId;
        criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        criteriaDto.IsSaleForOnline = this.isSaleForOnline;
        criteriaDto.IsTemporarilyUnavaible = this.isTemporarilyUnavaible;

        criteriaDto.StockStatId = this.stockStatId;

        criteriaDto.CategoryId = categoryDto.Id;
        criteriaDto.PageOffSet = categoryDto.ProductList.length;

        criteriaDto.ProductNameCode = this.searchValue;

        categoryDto.ProductListBusy = true;
        let subs = this.personProductService.getListForProfile(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                categoryDto.ProductListWaitTill = false;
                categoryDto.ProductListBusy = false;

                if (x.IsSuccess) {
                    let found: PersonProfileProductListDto = null;
                    x.Dto.forEach(element => {
                        found = categoryDto.ProductList.find(f => f.Id == element.Id);
                        if (this.utils.isNull(found)) {
                            element.ProductProfileUrl = this.productService.getProductProfileUrl(this.shopProfileDto.UrlName, element.ProductId, element.ProductTypeId);
                            element.StarAverage = this.utils.calcAverageStar(element.StarSum, element.StarCount);
                            categoryDto.ProductList.push(element);
                        }
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                categoryDto.ProductListWaitTill = false;
                categoryDto.ProductListBusy = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'getProductList', subs);
            }
        );
    }

    getUpperList(categoryDto: ProductCategoryListDto): void {
        const criteriaDto = new ProductCategoryGetListCriteriaDto();
        criteriaDto.IsUpper = true;
        criteriaDto.ProductCategoryId = categoryDto.Id;
        let subs = this.productCategoryService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    categoryDto.UpperCategoryList = [];
                    categoryDto.UpperCategoryName = '';
                    let i: number = 0;
                    let lordCategory: ProductCategoryListDto;
                    x.Dto.forEach(element => {
                        i++;

                        if (element.ParentId == 0) {
                            lordCategory = element;
                        }

                        if (element.ParentId > 0) {
                            if (categoryDto.Id != element.Id && element.ParentId != lordCategory.Id) {
                                categoryDto.UpperCategoryName += element.Name + " -> ";
                            }

                            categoryDto.UpperCategoryList.push(element);
                        }

                        if (x.Dto.length == i) {
                            categoryDto.UpperCategoryName = categoryDto.UpperCategoryName + categoryDto.Name;
                        }
                        if (x.Dto.length == i) {
                            categoryDto.FinishGetUpperList = true;
                            this.handleCategoryList();
                        }
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getUpperList', subs);
            }
        );
    }

    rootCategoryListDto: ProductCategoryListDto[];
    handleCategoryList(): void {
        if (this.utils.isNotNull(this.categoryListDto.find(f => !f.FinishGetUpperList))) return;

        this.rootCategoryListDto = [];
        let rootCategory: ProductCategoryListDto = null;
        let t_rootCategory: ProductCategoryListDto = null;
        let i: number = 0;
        this.categoryListDto.forEach(element => {
            i++;

            rootCategory = element.UpperCategoryList[0];

            if (rootCategory) {
                t_rootCategory = this.rootCategoryListDto.find(f => f.Id == rootCategory.Id);
                if (this.utils.isNull(t_rootCategory)) {

                    if (this.utils.isNull(rootCategory.SubCategoryList)) {
                        rootCategory.SubCategoryList = [];
                    }
                    rootCategory.SubCategoryList.push(element);

                    this.rootCategoryListDto.push(rootCategory);
                } else {
                    if (this.utils.isNull(t_rootCategory.SubCategoryList)) {
                        t_rootCategory.SubCategoryList = [];
                    }
                    t_rootCategory.SubCategoryList.push(element);
                }
            }

            if (this.categoryListDto.length == i) {
                this.busyCategory = false;

                /**
                 *   this.categoryListDto.forEach(element => {
                      this.getProductList(element);
                  });
                 */
            }
        });
    }

    onIntersection(event: any, subCategoryDto: ProductCategoryListDto): void {
        //console.log(event);

        if (this.busyCategory || !event.visible || subCategoryDto.GotProductList) return;

        subCategoryDto.GotProductList = true;
        this.getProductList(subCategoryDto);
    }

    addToBasket(isFastSale: boolean, listItem: PersonProfileProductListDto): void {
        const basketAddBo = new ModalBasketAddBo();
        basketAddBo.ShopId = this.shopProfileDto.ShopId;
        basketAddBo.ProductId = listItem.ProductId;
        basketAddBo.PersonProductId = listItem.Id;

        basketAddBo.IsFastSale = isFastSale;
        this.basketProductService.showModalAddToBasket(basketAddBo);
    }

    showProductOffer(): void {
        this.isProductOfferOpen = !this.isProductOfferOpen;

        if (!this.isProductOfferOpen) return;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}