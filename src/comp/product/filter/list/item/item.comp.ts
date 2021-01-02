import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';
import { Router } from '@angular/router';

// Comp
import { ProductFilterListIndexComp } from '../index.comp';

// Service
import { ProductService } from '../../../../../service/product/product.service';
import { ProductFilterService } from '../../../../../service/product/filter.service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { ProductFilterListDto } from '../../../../../dto/product/filter/list.dto';
import { ProductFilterListExtraDto } from '../../../../../dto/product/filter/list-extra.dto';
import { ProductFilterGetListExtraCriteriaDto } from '../../../../../dto/product/filter/getlist-extra-criteria.dto';

// Enum
import { environment } from '../../../../../environments/environment';
import { ProductCodeTypes } from '../../../../../enum/product/code-types.enum';
import { expandCollapse } from '../../../../../stc';

@Component({
    selector: 'product-filter-list-item',
    templateUrl: './item.comp.html',
    styleUrls: ['./item.comp.css'],
    animations: [expandCollapse]
})
export class ProductFilterListItemComp implements OnInit, OnDestroy {
    host: ProductFilterListIndexComp;

    @Input('listItem') listItem: ProductFilterListDto;

    extraDto: ProductFilterListExtraDto = null;

    environment = environment;
    productCodeTypes = ProductCodeTypes;

    busy: boolean = false;
    constructor(
        @Host() host: ProductFilterListIndexComp,
        private productFilterService: ProductFilterService,
        private productService: ProductService,
        private router: Router,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.host = host;
    }

    ngOnInit(): void {
        this.getExtra();
    }
    ngOnDestroy(): void {
    }

    getProductProfileUrl(): string {
        return this.productService.getProductProfileUrl(this.listItem.ShopUrlName, this.listItem.ProductId, this.listItem.ProductTypeId);
    }

    goToProductProfile(): void {
        this.router.navigateByUrl(this.getProductProfileUrl());
    }

    goToShopProfile(): void {
        this.router.navigateByUrl(this.listItem.ShopUrlName);
    }

    getExtra(): void {
        const criteriaDto = new ProductFilterGetListExtraCriteriaDto();
        criteriaDto.PersonProductId = this.listItem.PersonProductId;
        this.busy = true;
        let subs = this.productFilterService.getListExtra(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.extraDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getExtra', subs);
                this.busy = false;
            }
        );
    }
}