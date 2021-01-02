import { Component, Host, Input } from '@angular/core';

// Comp
import { FicheProductListIndexComp } from '../index.comp';

// Service
import { ProductService } from '../../../../../../service/product/product.service';
import { UtilService } from '../../../../../../service/sys/util.service';

// Dto
import { FicheProductDto } from '../../../../../../dto/fiche/product/product.dto';

// Enums
import { Currencies } from '../../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../../enum/sys/stats.enum';
import { AccountTypes } from '../../../../../../enum/person/account-type.enum';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { ProductCodeTypes } from '../../../../../../enum/product/code-types.enum';
import { ProductTypes } from '../../../../../../enum/product/types.enum';

@Component({
    selector: 'fiche-product-list-item',
    templateUrl: './item.comp.html'
})
export class FicheProductListItemComp {
    host: FicheProductListIndexComp;

    @Input('listItem') listItem: FicheProductDto;

    configCurrency: CurrencyMaskConfig;
    configPercentage: CurrencyMaskConfig;
    configQuantity: CurrencyMaskConfig;

    currencies = Currencies;
    stats = Stats;
    accountTypes = AccountTypes;
    productCodeTypes = ProductCodeTypes;
    productTypes = ProductTypes;

    busy: boolean = false;

    constructor(
        @Host() host: FicheProductListIndexComp,
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