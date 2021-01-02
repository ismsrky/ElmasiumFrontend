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
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { expandCollapse, Stc } from '../../../../stc';
import { isNumeric } from 'rxjs/internal-compatibility';

@Component({
    selector: 'product-filter-other',
    templateUrl: './other.comp.html',
    animations: [expandCollapse]
})
export class ProductFilterOtherComp implements OnInit, OnDestroy {
    host: ProductFilterIndexComp;

    minPrice: number = null;
    maxPrice: number = null;

    configCurrency: CurrencyMaskConfig;

    oldQueryParams: HttpParams;

    urlWithoutParams: string = '';

    busy: boolean = false;
    constructor(
        @Host() host: ProductFilterIndexComp,
        private appRouterService: AppRouterService,
        private activatedRoute: ActivatedRoute,
        private utils: UtilService) {
        this.host = host;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.host.profile.SelectedCurrencyId);
        this.configCurrency.nullable = true;

        this.urlWithoutParams = this.appRouterService.getUrlWithoutParams();

        let subscribeQueryParams = this.activatedRoute.queryParamMap.subscribe(params => {
            this.utils.unsubs(subscribeQueryParams);

            if (this.utils.isNotNull(params)) {
                let paramMinPrice = params.get(Stc.paramMinPrice);
                let paramMaxPrice = params.get(Stc.paramMaxPrice);

                if (this.utils.isNotNull(paramMinPrice) && isNumeric(paramMinPrice)) {
                    this.minPrice = parseFloat(paramMinPrice);
                }
                if (this.utils.isNotNull(paramMaxPrice) && isNumeric(paramMaxPrice)) {
                    this.maxPrice = parseFloat(paramMaxPrice);
                }
            }

            let subscribeGetParams = this.appRouterService.getParams(params, [Stc.paramMinPrice, Stc.paramMaxPrice, Stc.paramPageNumber]).subscribe(
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

    searhPrice(): void {
        this.appRouterService.navigateUrlWithParam(this.urlWithoutParams,
            [
                { key: Stc.paramMinPrice, value: this.minPrice },
                { key: Stc.paramMaxPrice, value: this.maxPrice }
            ],
            this.oldQueryParams);
    }
}