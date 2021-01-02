import { Component, OnInit, OnDestroy, Host } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

// Comp
import { ProductFilterIndexComp } from '../index.comp';

// Service
import { AppRouterService } from '../../../../service/sys/router.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto

// Bo

// Enum
import { expandCollapse, Stc } from '../../../../stc';

@Component({
    selector: 'product-filter-selected',
    templateUrl: './selected.comp.html',
    animations: [expandCollapse]
})
export class ProductFilterSelectedComp implements OnInit, OnDestroy {
    host: ProductFilterIndexComp;

    searchWord: string = null;

    oldQueryParams: HttpParams;

    urlWithoutParams: string = '';

    busy: boolean = false;
    constructor(
        @Host() host: ProductFilterIndexComp,
        private appRouterService: AppRouterService,
        private activatedRoute: ActivatedRoute,
        private utils: UtilService) {
        this.host = host;

        this.urlWithoutParams = this.appRouterService.getUrlWithoutParams();

        let subscribeQueryParams = this.activatedRoute.queryParamMap.subscribe(params => {
            this.utils.unsubs(subscribeQueryParams);

            if (this.utils.isNotNull(params)) {
                this.searchWord = params.get(Stc.paramSearchWord);
            }

            let subscribeGetParams = this.appRouterService.getParams(params, [Stc.paramSearchWord, Stc.paramPageNumber]).subscribe(
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

    searhWord(): void {
        this.appRouterService.navigateUrlWithParam(this.urlWithoutParams,
            [
                { key: Stc.paramSearchWord, value: this.searchWord }
            ],
            this.oldQueryParams);
    }
}