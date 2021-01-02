import { Component, Host, Input } from '@angular/core';

// Comp
import { PosProductListIndexComp } from '../index.comp';

// Service
import { ProductService } from '../../../../service/product/product.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { FicheProductDto } from '../../../../dto/fiche/product/product.dto';

// Enums
import { Currencies } from '../../../../enum/person/currencies.enum';
import { Stats } from '../../../../enum/sys/stats.enum';
import { AccountTypes } from '../../../../enum/person/account-type.enum';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { environment } from '../../../../environments/environment';
import { ProductCodeTypes } from '../../../../enum/product/code-types.enum';
import { ProductTypes } from '../../../../enum/product/types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'pos-product-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class PosProductListItemComp {
    host: PosProductListIndexComp;

    @Input('listItem') listItem: FicheProductDto;

    configCurrency: CurrencyMaskConfig;
    configPercentage: CurrencyMaskConfig;
    configQuantity: CurrencyMaskConfig;

    environment = environment;

    currencies = Currencies;
    stats = Stats;
    accountTypes = AccountTypes;
    productCodeTypes = ProductCodeTypes;
    productTypes = ProductTypes;

    busy: boolean = false;

    constructor(
        @Host() host: PosProductListIndexComp,
        private productService: ProductService,
        private utils: UtilService) {
        this.host = host;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.host.host.ficheDto.CurrencyId);
        this.configPercentage = this.utils.getPercentageMaskOptions();
        this.configQuantity = this.utils.getQuantityMaskOptions();
    }

    getProductProfileUrl(): string {
        let fullUrl: string = this.productService.getProductProfileUrl(this.host.host.profile.UrlName, this.listItem.ProductId, this.listItem.ProductTypeId); //'/' + this.host.host.profile.UrlName + '/' + this.listItem.ProductId.toString();
        return fullUrl;
    }
}