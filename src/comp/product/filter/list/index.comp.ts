import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { isNumeric } from 'rxjs/internal-compatibility';

// Comp
import { AppPagerComp } from '../../../general/pager/pager.comp';

// Service
import { ProductFilterService } from '../../../../service/product/filter.service';
import { BasketProductService } from '../../../../service/basket/product.service';
import { AuthService } from '../../../../service/auth/auth.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { ProductFilterGetListCriteriaDto } from '../../../../dto/product/filter/getlist-criteria.dto';
import { ProductFilterListSummaryDto } from '../../../../dto/product/filter/list-summary.dto';
import { ProductFilterListDto } from '../../../../dto/product/filter/list.dto';

// Bo
import { ModalBasketAddBo } from '../../../../bo/modal/basket-add.bo';
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { Stc, expandCollapse } from '../../../../stc';

@Component({
    selector: 'product-filter-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class ProductFilterListIndexComp implements OnInit, OnDestroy {
    productListDto: ProductFilterListDto[];
    filterSummaryDto: ProductFilterListSummaryDto;
    criteriaDto: ProductFilterGetListCriteriaDto;

    @ViewChild(AppPagerComp, { static: false }) childAppPagerComp: AppPagerComp;

    selectedCategoryId: number = null;

    profile: PersonProfileBo;

    subsNeedRefresh: Subscription;
    subsSaved: Subscription;

    showNotFound: boolean = false;
    busy: boolean = false;

    fullUrl: string = '';

    isNarrow: boolean = true;
    constructor(
        private authService: AuthService,
        private basketProductService: BasketProductService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private productFilterService: ProductFilterService,
        private localStorageService: LocalStorageService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;

        this.fullUrl = this.router.url;
        this.productListDto = [];
    }

    ngOnInit(): void {
        this.isNarrow = window.innerWidth <= 768;

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.search();
                    this.profile = this.localStorageService.personProfile;
                } else if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('selectedCategoryIdChanged')) {
                        const data = JSON.parse(x).selectedCategoryIdChanged;

                        this.selectedCategoryId = data.selectedCategoryId;

                        this.search();
                    }
                }
            }
        );
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (x == 'AddressAreaSaved') {
                    this.search();
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subsSaved);
    }

    search(): void {
        let subscribeQueryParams = this.activatedRoute.queryParamMap.subscribe(params => {
            this.utils.unsubs(subscribeQueryParams);

            this.handleCriteria(params);

            setTimeout(() => {
                this.getList();
            }, 200);

            setTimeout(() => {
                this.getSummary();
            }, 500);
        });
    }

    getList(): void {
        this.busy = true;
        this.showNotFound = false;
        let subs = this.productFilterService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.productListDto = x.Dto;

                    if (this.utils.isNotNull(this.productListDto)) {
                        this.productListDto.forEach(element => {
                            element.StarAverage = this.utils.calcAverageStar(element.StarSum, element.StarCount);
                            element.ShopStarAverage = this.utils.calcAverageStar(element.ShopStarSum, element.ShopStarCount);
                        });
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }

                this.showNotFound = this.utils.isNull(x.Dto) || x.Dto.length == 0;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getList', subs);
                this.busy = false;
            }
        );
    }

    getSummary(): void {
        let subs = this.productFilterService.getListSummary(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.filterSummaryDto = x.Dto;

                    setTimeout(() => {
                        this.childAppPagerComp.show(this.filterSummaryDto.Count, this.filterSummaryDto.PageSize, this.criteriaDto.PageNumber);
                    });

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({
                        'ProductFilterSummaryChanged':
                            { 'filterSummaryDto': this.filterSummaryDto }
                    }));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getSummary', subs);
            }
        );
    }

    handleCriteria(params: ParamMap): void {
        this.criteriaDto = new ProductFilterGetListCriteriaDto();
        this.criteriaDto.SearchWord = params.get(Stc.paramSearchWord);
        this.criteriaDto.ProductCategoryId = this.selectedCategoryId;

        this.handlePropertyParams(params);

        let pageNumber: string = params.get(Stc.paramPageNumber);
        if (this.utils.isNotNull(pageNumber) && this.utils.isPositiveInteger(pageNumber)) {
            this.criteriaDto.PageNumber = parseInt(pageNumber);
        } else {
            this.criteriaDto.PageNumber = null;
        }

        let minPrice: string = params.get(Stc.paramMinPrice);
        let maxPrice: string = params.get(Stc.paramMaxPrice);

        if (this.utils.isNotNull(minPrice) && isNumeric(minPrice)) {
            this.criteriaDto.MinPrice = parseFloat(minPrice);
        } else {
            this.criteriaDto.MinPrice = null;
        }

        if (this.utils.isNotNull(maxPrice) && isNumeric(maxPrice)) {
            this.criteriaDto.MaxPrice = parseFloat(maxPrice);
        } else {
            this.criteriaDto.MaxPrice = null;
        }
    }

    handlePropertyParams(params: ParamMap): void {
        this.criteriaDto.PropertyList = [];
        if (this.utils.isNotNull(params) && this.utils.isNotNull(params.keys) && params.keys.length > 0) {
            params.keys.forEach(key => {
                this.criteriaDto.PropertyList.push(params.get(key));
            });
        }
    }

    addToBasket(isFastSale: boolean, listItem: ProductFilterListDto): void {
        const basketAddBo = new ModalBasketAddBo();
        basketAddBo.ShopId = listItem.ShopId;
        basketAddBo.ProductId = listItem.ProductId;
        basketAddBo.PersonProductId = listItem.PersonProductId;

        basketAddBo.IsFastSale = isFastSale;
        this.basketProductService.showModalAddToBasket(basketAddBo);

        if (isFastSale && !this.authService.handleRealLoginRequired()) return;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}