import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

// Comp

// Service
import { AppRouterService } from '../../../service/sys/router.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto

// Bo
import { PagerInfoBo } from '../../../bo/general/pager-info.bo';

// Enum
import { expandCollapse, Stc } from '../../../stc';

@Component({
    selector: 'app-pager',
    templateUrl: './pager.comp.html',
    animations: [expandCollapse]
})
export class AppPagerComp implements OnInit, OnDestroy {
    pagerInfoBo: PagerInfoBo;

    oldQueryParams: HttpParams;

    urlWithoutParams: string = '';
    constructor(
        private appRouterService: AppRouterService,
        private activatedRoute: ActivatedRoute,
        private utils: UtilService) {
        this.urlWithoutParams = this.appRouterService.getUrlWithoutParams();

        let subscribeQueryParams = this.activatedRoute.queryParamMap.subscribe(params => {
            this.utils.unsubs(subscribeQueryParams);

            let subscribeGetParams = this.appRouterService.getParams(params, [Stc.paramPageNumber]).subscribe(
                x => {
                    this.utils.unsubs(subscribeGetParams);

                    this.oldQueryParams = x;
                }
            );
        });
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(count: number, pageSize: number, currentPage: number): void {
        this.pagerInfoBo = this.appRouterService.getPager(count, currentPage, pageSize);
    }

    goToPage(page: number): void {
        this.appRouterService.navigateUrlWithParam(this.urlWithoutParams, [{ key: Stc.paramPageNumber, value: page.toString() }], this.oldQueryParams);
    }
}