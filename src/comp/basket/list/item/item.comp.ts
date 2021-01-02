import { Component, OnInit, OnDestroy, Input, Host, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { BasketListIndexComp } from '../index.comp';
import { IncludeExcludeSelectComp } from '../../../include-exclude/select/select.comp';
import { OptionSelectComp } from '../../../option/select/select.comp';

// Service
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { BasketListDto } from '../../../../dto/basket/list.dto';

// Enum
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { ProductTypes } from '../../../../enum/product/types.enum';
import { ProductCodeTypes } from '../../../../enum/product/code-types.enum';
import { environment } from '../../../../environments/environment';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'basket-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class BasketListItemComp implements OnInit, OnDestroy, AfterViewInit {
    @Input('listItem') listItem: BasketListDto;

    host: BasketListIndexComp;

    @ViewChildren(OptionSelectComp) childOptionSelectCompList: QueryList<OptionSelectComp>;
    @ViewChildren(IncludeExcludeSelectComp) childIncludeExcludeSelectCompList: QueryList<IncludeExcludeSelectComp>;

    subsNeedRefresh: Subscription;

    busy: boolean = false;

    configQuantity: CurrencyMaskConfig;

    productTypes = ProductTypes;
    productCodeTypes = ProductCodeTypes;
    environment = environment;

    constructor(
        @Host() host: BasketListIndexComp,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {
        this.host = host;

        this.configQuantity = this.utils.getQuantityMaskOptions();
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (!this.host.isReadonly && x.includes('OptionSelectCompCalculate')) {
                        const personProductId: number = JSON.parse(x).OptionSelectCompCalculate.personProductId;

                        this.listItem.ProductList.forEach(tProduct => {
                            if (personProductId == tProduct.PersonProductId) {
                                let tOptionComp = this.childOptionSelectCompList.find(f => f.uniqueId == tProduct.Id);

                                if (tOptionComp.isValid()) {
                                    this.host.updateOption(tOptionComp.selectedOptionIdList, tProduct);
                                }
                            }
                        });
                    } else if (!this.host.isReadonly && x.includes('IncludeExcludeSelectCompCalculate')) {
                        const personProductId: number = JSON.parse(x).IncludeExcludeSelectCompCalculate.personProductId;

                        this.listItem.ProductList.forEach(tProduct => {
                            if (personProductId == tProduct.PersonProductId) {
                                let tSelectedIdList: number[] = this.childIncludeExcludeSelectCompList.find(f => f.uniqueId == tProduct.Id && f.isInclude).selectedIdList.concat(
                                    this.childIncludeExcludeSelectCompList.find(f => f.uniqueId == tProduct.Id && f.isInclude == false).selectedIdList
                                );

                                this.host.updateIncludeExclude(tSelectedIdList, tProduct);
                            }
                        });
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }
    ngAfterViewInit(): void {
        this.handleSelectedOptions();
        this.handleSelectedIEs();
    }

    handleSelectedOptions(): void {
        let tSelectedIdList: number[] = null;
        let i: number = 0;
        this.listItem.ProductList.forEach(tProduct => {
            if (this.utils.isNull(tProduct.OptionList) || tProduct.OptionList.length == 0) {
                tSelectedIdList = null;
                this.childOptionSelectCompList.find(f => f.uniqueId == tProduct.Id).show(tProduct.PersonProductId, this.listItem.CurrencyId, null);
            } else {
                tSelectedIdList = [];

                i = 0;
                tProduct.OptionList.forEach(tOption => {
                    i++;

                    tSelectedIdList.push(tOption.OptionId);

                    if (i == tProduct.OptionList.length) {
                        this.childOptionSelectCompList.find(f => f.uniqueId == tProduct.Id).show(tProduct.PersonProductId, this.listItem.CurrencyId, tSelectedIdList);
                    }
                });
            }
        });
    }

    handleSelectedIEs(): void {
        let tSelectedIncludeIdList: number[] = null;
        let tSelectedExcludeIdList: number[] = null;
        let i: number = 0;
        this.listItem.ProductList.forEach(tProduct => {
            if (this.utils.isNull(tProduct.IncludeExcludeList) || tProduct.IncludeExcludeList.length == 0) {
                tSelectedIncludeIdList = null;
                tSelectedExcludeIdList = null;
                this.childIncludeExcludeSelectCompList.find(f => f.uniqueId == tProduct.Id && f.isInclude).show(tProduct.PersonProductId, this.listItem.CurrencyId, null);
                this.childIncludeExcludeSelectCompList.find(f => f.uniqueId == tProduct.Id && f.isInclude == false).show(tProduct.PersonProductId, this.listItem.CurrencyId, null);
            } else {
                tSelectedIncludeIdList = [];
                tSelectedExcludeIdList = [];

                i = 0;
                tProduct.IncludeExcludeList.forEach(tIe => {
                    i++;

                    if (tIe.IsInclude) {
                        tSelectedIncludeIdList.push(tIe.Id);
                    } else {
                        tSelectedExcludeIdList.push(tIe.Id);
                    }

                    if (i == tProduct.IncludeExcludeList.length) {
                        this.childIncludeExcludeSelectCompList.find(f => f.uniqueId == tProduct.Id && f.isInclude)
                            .show(tProduct.PersonProductId, this.listItem.CurrencyId, tSelectedIncludeIdList);
                        this.childIncludeExcludeSelectCompList.find(f => f.uniqueId == tProduct.Id && f.isInclude == false)
                            .show(tProduct.PersonProductId, this.listItem.CurrencyId, tSelectedExcludeIdList);
                    }
                });
            }
        });
    }
}