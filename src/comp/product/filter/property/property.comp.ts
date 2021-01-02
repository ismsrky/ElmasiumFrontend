import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';

// Comp
import { PropertyCrudComp } from '../../../property/crud/crud.comp';
import { OptionCrudComp } from '../../../option/crud/crud.comp';
import { IncludeExcludeCrudComp } from '../../../include-exclude/crud/crud.comp';

// Service
import { AuthService } from '../../../../service/auth/auth.service';
import { AppRouterService } from '../../../../service/sys/router.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { ProductCategoryListDto } from '../../../../dto/product/category/list.dto';
import { PropertyListDto } from '../../../../dto/property/list.dto';
import { ProductFilterListSummaryDto } from '../../../../dto/product/filter/list-summary.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse, Stc } from '../../../../stc';

@Component({
    selector: 'product-filter-property',
    templateUrl: './property.comp.html',
    animations: [expandCollapse]
})
export class ProductFilterPropertyComp implements OnInit, OnDestroy {
    // comes from outside.
    selectedCategoryId: number = null;
    selectedCategory: ProductCategoryListDto = null;

    oldQueryParams: HttpParams;
    urlWithoutParams: string = '';

    filterSummaryDto: ProductFilterListSummaryDto;

    isPropertyModalOpen: boolean = false;
    isOptionModalOpen: boolean = false;
    isIncludeExcludeModalOpen: boolean = false;

    isAdmin: boolean = false;

    subscriptionModalClosed: Subscription;
    subsNeedRefresh: Subscription;

    @ViewChild(PropertyCrudComp, { static: false }) childPropertyCrudComp: PropertyCrudComp;
    @ViewChild(OptionCrudComp, { static: false }) childOptionCrudComp: OptionCrudComp;
    @ViewChild(IncludeExcludeCrudComp, { static: false }) childIncludeExcludeCrudComp: IncludeExcludeCrudComp;

    busy: boolean = false;
    constructor(
        private compBroadCastService: CompBroadCastService,
        private appRouterService: AppRouterService,
        private authService: AuthService,
        private activatedRoute: ActivatedRoute,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.checkIsAdmin();

        this.filterSummaryDto = new ProductFilterListSummaryDto();
        this.filterSummaryDto.PropertyList = [];

        this.urlWithoutParams = this.appRouterService.getUrlWithoutParams();
    }

    ngOnInit(): void {
        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'PropertyCrudComp') {
                    this.isPropertyModalOpen = false;
                } else if (x == 'OptionCrudComp') {
                    this.isOptionModalOpen = false;
                } else if (x == 'IncludeExcludeCrudComp') {
                    this.isIncludeExcludeModalOpen = false;
                }
            });
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('selectedCategoryIdChanged')) {
                        const data = JSON.parse(x).selectedCategoryIdChanged;

                        this.selectedCategoryId = data.selectedCategoryId;

                        this.selectedCategory = null;
                    } else if (x.includes('selectedCategoryChanged')) {
                        const data = JSON.parse(x).selectedCategoryChanged;

                        this.selectedCategory = data.selectedCategory;
                    } else if (x.includes('ProductFilterSummaryChanged')) {
                        const data = JSON.parse(x).ProductFilterSummaryChanged;

                        this.filterSummaryDto = data.filterSummaryDto;
                        this.handleOldQueryParams();
                        this.handleCheckedList();
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionModalClosed);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    handleOldQueryParams(): void {
        const excludingParam: string[] = [];
        excludingParam.push(Stc.paramPageNumber);

        let subscribeQueryParams = this.activatedRoute.queryParamMap.subscribe(params => {
            this.utils.unsubs(subscribeQueryParams);

            if (this.utils.isNotNull(this.filterSummaryDto.PropertyList) && this.filterSummaryDto.PropertyList.length > 0) {
                let i: number = 0;
                this.filterSummaryDto.PropertyList.forEach(element => {
                    i++;

                    excludingParam.push(element.UrlName);

                    if (i == this.filterSummaryDto.PropertyList.length) {
                        this.handleOldQueryParamsSub(params, excludingParam);
                    }
                });
            } else {
                this.handleOldQueryParamsSub(params, excludingParam);
            }

        });
    }
    handleOldQueryParamsSub(params: ParamMap, excludingParam: string[]): void {

        let subscribeGetParams = this.appRouterService.getParams(params, excludingParam).subscribe(
            x => {
                this.utils.unsubs(subscribeGetParams);

                this.oldQueryParams = x;
            }
        );
    }

    handleCheckedList(): void {
        let subscribeQueryParams = this.activatedRoute.queryParamMap.subscribe(params => {
            this.utils.unsubs(subscribeQueryParams);

            if (this.utils.isNotNull(this.filterSummaryDto.PropertyList)) {
                this.filterSummaryDto.PropertyList.forEach(group => {
                    group.PropertyList.forEach(property => {
                        let tParamValue = params.get(group.UrlName);

                        property.IsChecked = this.utils.isNotNull(tParamValue) && property.UrlName == tParamValue;
                    });
                });
            }
        });
    }

    propertyChanged(): void {
        let propertyListStr = '';
        let i: number = 0;
        let f: number = 0;

        let extraParam: { key: string, value: string }[] = [];

        this.filterSummaryDto.PropertyList.forEach(propertyGroup => {
            i++;

            f = 0;

            propertyListStr = '';
            propertyGroup.PropertyList.forEach(property => {
                f++;

                if (property.IsChecked) {
                    propertyListStr += property.UrlName.toString() + '-';
                }

                if (f == propertyGroup.PropertyList.length) {
                    if (this.utils.isNotNull(propertyListStr)) {
                        propertyListStr = propertyListStr.substring(0, propertyListStr.length - 1);

                        extraParam.push({ key: propertyGroup.UrlName, value: propertyListStr });
                    }

                    if (i == this.filterSummaryDto.PropertyList.length) {
                        this.appRouterService.navigateUrlWithParam(this.urlWithoutParams, extraParam, this.oldQueryParams);
                    }
                }
            });
        });
    }
    showGroup(groupList: PropertyListDto): boolean {
        if (this.utils.isNull(groupList.PropertyList) || groupList.PropertyList.length == 0) return false;

        return this.utils.isNotNull(groupList.PropertyList.find(f => f.Count > 0));
    }
    showExpand(groupList: PropertyListDto): boolean {
        if (this.utils.isNull(groupList.PropertyList)) return false;

        const filtered = groupList.PropertyList.filter(f => f.Count > 0);
        return this.utils.isNotNull(filtered) && filtered.length > 5;
    }

    openSaveProperty(): void {
        this.isPropertyModalOpen = true;

        setTimeout(() => {
            let subsShowModal = this.childPropertyCrudComp.showModal(this.selectedCategoryId).subscribe(
                x => {
                    this.utils.unsubs(subsShowModal);
                }
            );
        });
    }
    openSaveOption(): void {
        this.isOptionModalOpen = true;

        setTimeout(() => {
            let subsShowModal = this.childOptionCrudComp.showModal(this.selectedCategoryId).subscribe(
                x => {
                    this.utils.unsubs(subsShowModal);
                }
            );
        });
    }
    openSaveIncludeExclude(isInclude: boolean): void {
        this.isIncludeExcludeModalOpen = true;

        setTimeout(() => {
            let subsShowModal = this.childIncludeExcludeCrudComp.showModal(this.selectedCategoryId, isInclude).subscribe(
                x => {
                    this.utils.unsubs(subsShowModal);
                }
            );
        });
    }

    checkIsAdmin(): void {
        let subs = this.authService.isAdmin().subscribe(
            x => {
                this.utils.unsubs(subs);

                this.isAdmin = x.IsSuccess;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'checkIsAdmin', subs);
            }
        );
    }
}