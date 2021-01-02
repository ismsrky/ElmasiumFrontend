import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Subscription } from 'rxjs';

// Comp
import { ProductCategoryBreadcrumbComp } from '../category/breadcrumb/breadcrumb.comp';
import { AddressBreadcrumbComp } from '../../address/breadcrumb/breadcrumb.comp';
import { PageTitleComp } from '../../general/page-title/page-title.comp';

// Service
import { ProductCategoryService } from '../../../service/product/category.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { ProductCategoryListDto } from '../../../dto/product/category/list.dto';
import { ProductCategoryCheckUrlCriteriaDto } from '../../../dto/product/category/checkurl-criteria.dto';
import { ProductCategoryGetListCriteriaDto } from '../../../dto/product/category/getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';
import { PageTitleInfoBo } from '../../../bo/general/page-title-info.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'product-filter-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class ProductFilterIndexComp implements OnInit, OnDestroy {
    selectedCategoryId: number = null;

    categoryListDto: ProductCategoryListDto[];

    @ViewChild(ProductCategoryBreadcrumbComp, { static: false }) childProductCategoryBreadcrumbComp: ProductCategoryBreadcrumbComp;
    @ViewChild(PageTitleComp, { static: true }) childPageTitleComp: PageTitleComp;
    @ViewChild(AddressBreadcrumbComp, { static: false }) childAddressBreadcrumbComp: AddressBreadcrumbComp;

    pageTitleInfoBo: PageTitleInfoBo;

    subsNeedRefresh: Subscription;
    subsDeleted: Subscription;

    profile: PersonProfileBo;

    busy: boolean = false;
    constructor(
        private productCategoryService: ProductCategoryService,
        private compBroadCastService: CompBroadCastService,
        private activatedRoute: ActivatedRoute,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;

        this.checkUrl(this.activatedRoute.snapshot.url);

        this.categoryListDto = [];

        scroll(0, 0);
    }

    ngOnInit(): void {
        const firstSegment = this.activatedRoute.snapshot.url[0].path;
        this.pageTitleInfoBo = this.productCategoryService.getPageTitleInfo(firstSegment);
        this.childPageTitleComp.setInfoBo(this.pageTitleInfoBo);

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;

                    this.checkUrl(this.activatedRoute.snapshot.url);
                }
            }
        );
        this.subsDeleted = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Deleted).subscribe(
            x => {
                if (x == 'ProductFilterCategoryComp') {
                    this.checkUrl(this.activatedRoute.snapshot.url);
                }
            }
        );

        setTimeout(() => {
            this.childAddressBreadcrumbComp.loadData();
        }, 1000);
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subsDeleted);
    }

    checkUrl(urlSegmentList: UrlSegment[]): void {
        const criteriaDto = new ProductCategoryCheckUrlCriteriaDto();
        criteriaDto.UrlSegmentList = [];
        urlSegmentList.forEach(element => {
            criteriaDto.UrlSegmentList.push(element.path);
        });
        let subs = this.productCategoryService.checkUrl(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.selectedCategoryId = x.Dto.ProductCategoryId;

                    this.childProductCategoryBreadcrumbComp.setCategoryId(this.selectedCategoryId);

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({
                        'selectedCategoryIdChanged':
                            { 'selectedCategoryId': this.selectedCategoryId }
                    }));

                    this.getProductCategoryList();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'checkUrl', subs);
            }
        );
    }

    getProductCategoryList(): void {
        const criteriaDto = new ProductCategoryGetListCriteriaDto();
        criteriaDto.ProductCategoryId = this.selectedCategoryId;
        criteriaDto.IsUpper = false;
        let subs = this.productCategoryService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.categoryListDto = x.Dto;

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({
                        'ProductCategoryListChanged':
                            { 'categoryListDto': this.categoryListDto }
                    }));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getProductCategoryList', subs);
            }
        );
    }
}