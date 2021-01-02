import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, Observable, Subject } from 'rxjs';
import { Router, NavigationEnd, ParamMap } from '@angular/router';
import { AppRoutes } from '../../enum/sys/routes.enum';
import { UtilService } from './util.service';
import { PagerInfoBo } from '../../bo/general/pager-info.bo';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class AppRouterService implements OnDestroy {
    previousUrl: string;
    private currentUrl: string;

    subscriptionRouter: Subscription;
    constructor(
        private router: Router,
        private utils: UtilService) {
        this.currentUrl = this.router.url;

        this.subscriptionRouter = router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            };
        });
    }

    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionRouter);
    }
    navigate(routeValue: AppRoutes): void {
        this.router.navigateByUrl(routeValue.toString());
    }

    navigateUrlWithParam(urlWithoutParam: string, extraParam: { key: string, value: any }[], oldQueryParams: HttpParams): void {
        if (this.utils.isNull(oldQueryParams)) {
            oldQueryParams = new HttpParams();
        }

        if (this.utils.isNotNull(extraParam) && extraParam.length > 0) {
            extraParam.forEach(element => {
                if (this.utils.isNotNull(element.value)) {
                    oldQueryParams = oldQueryParams.append(element.key, element.value);
                }
            });
        }

        setTimeout(() => {
            const queryStr = oldQueryParams.toString();

            let url = urlWithoutParam + '?' + queryStr;

            this.router.navigateByUrl(url);
        });
    }
    navigatePrevUrl(): void {
        this.router.navigateByUrl(this.previousUrl);
    }

    getPager(totalItemsCount: number, currentPage: number = 1, pageSize: number = 10): PagerInfoBo {
        // This method is taken from url below:
        // https://jasonwatmore.com/post/2016/08/23/angular-2-pagination-example-with-logic-like-google

        if (this.utils.isNull(currentPage))
            currentPage = 1;

        // calculate total pages
        let totalPages = Math.ceil(totalItemsCount / pageSize);

        // ensure current page isn't out of range
        if (currentPage < 1) {
            currentPage = 1;
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        let startPage: number, endPage: number;
        if (totalPages <= 10) {
            // less than 10 total pages so show all
            startPage = 1;
            endPage = totalPages;
        } else {
            // more than 10 total pages so calculate start and end pages
            if (currentPage <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (currentPage + 4 >= totalPages) {
                startPage = totalPages - 9;
                endPage = totalPages;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }

        // calculate start and end item indexes
        let startIndex = (currentPage - 1) * pageSize;
        let endIndex = Math.min(startIndex + pageSize - 1, totalItemsCount - 1);

        // create an array of pages to ng-repeat in the pager control
        let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

        // return object with all pager properties required by the view

        let pagerInfo = new PagerInfoBo();
        pagerInfo.TotalItemsCount = totalItemsCount;

        pagerInfo.CurrentPage = currentPage;
        pagerInfo.PageSize = pageSize;
        pagerInfo.TotalPages = totalPages;
        pagerInfo.StartPage = startPage;
        pagerInfo.EndPage = endPage;
        pagerInfo.StartIndex = startIndex;
        pagerInfo.EndIndex = endIndex;
        pagerInfo.Pages = pages;

        return pagerInfo;
    }

    getUrlWithoutParams(): string {
        const urlTree = this.router.parseUrl(this.router.url);
        const fullUrl = '/' + urlTree.root.children['primary'].segments.map(it => it.path).join('/');

        return fullUrl;
    }

    //private _eventBus: Subject<HttpParams>;
    getParams(params: ParamMap, excludingParam: string[] = null): Observable<HttpParams> {
        const _eventBus = new Subject<HttpParams>();
        let oldQueryParams: HttpParams;

        const hasEx: boolean = this.utils.isNotNull(excludingParam) && excludingParam.length > 0;

        setTimeout(() => {
            if (this.utils.isNotNull(params) && this.utils.isNotNull(params.keys) && params.keys.length > 0) {

                let i: number = 0;
                oldQueryParams = new HttpParams();
                params.keys.forEach(key => {
                    i++;

                    if (!hasEx || (hasEx && !excludingParam.includes(key))) {
                        let value = params.get(key);

                        oldQueryParams = oldQueryParams.append(key, value);
                    }

                    if (i == params.keys.length) {
                        _eventBus.next(oldQueryParams);
                    }
                });
            } else {
                _eventBus.next(null);
            }
        });

        return _eventBus.asObservable();
    }

    /**
     * get getCurrentRoute(): AppRoutes {
        let retValue: AppRoutes;
        let url = this.router.url;
        if (this.router.url.startsWith('/')) {
            url = url.substring(1, url.length);
        }
        switch (url) {
            case AppRoutes.homepage.toString():
                retValue = AppRoutes.homepage;
                break;

            case AppRoutes.generalMine.toString():
                retValue = AppRoutes.generalMine;
                break;
            case AppRoutes.generalNew.toString():
                retValue = AppRoutes.generalNew;
                break;
            case AppRoutes.generalRetail.toString():
                retValue = AppRoutes.generalRetail;
                break;
            case AppRoutes.generalConnections.toString():
                retValue = AppRoutes.generalConnections;
                break;


            case AppRoutes.definitionsMoneyAccount.toString():
                retValue = AppRoutes.definitionsMoneyAccount;
                break;
            case AppRoutes.definitionsProductLabor.toString():
                retValue = AppRoutes.definitionsProductLabor;
                break;
            case AppRoutes.definitionsAddress.toString():
                retValue = AppRoutes.definitionsAddress;
                break;


            case AppRoutes.activitiesFiche.toString():
                retValue = AppRoutes.activitiesFiche;
                break;
            case AppRoutes.activitiesMoney.toString():
                retValue = AppRoutes.activitiesMoney;
                break;
            case AppRoutes.activitiesStock.toString():
                retValue = AppRoutes.activitiesStock;
                break;
            default:
                retValue = AppRoutes.unknown;
                break;
        }
        //console.log(this.router);
        return retValue;
    }
     */
}