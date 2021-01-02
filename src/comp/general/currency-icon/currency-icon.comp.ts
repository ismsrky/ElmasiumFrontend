import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CurrenciesDto } from '../../../dto/enumsOp/currencies.dto';
import { Currencies } from '../../../enum/person/currencies.enum';
import { Stc } from '../../../stc';
import { UtilService } from '../../../service/sys/util.service';

@Component({
    selector: 'currency-icon',
    templateUrl: './currency-icon.comp.html'
})
export class CurrencyIconComp implements OnChanges {
    @Input('currencyId') currencyId: Currencies;

    @Input('useString') useString: boolean = false;
    @Input('showName') showName: boolean = false;

    currencyDto: CurrenciesDto;

    constructor(private utils: UtilService) {
        this.currencyDto = null;
    }
    ngOnChanges(changes: SimpleChanges) {
        if (this.utils.isNull(this.currencyId)) {
            this.currencyDto = null;
            return;
        }

        setTimeout(() => {
            this.currencyDto = Stc.currenciesDto.find(f => f.Id == this.currencyId);
        });

        //this.doSomething(changes.categoryId.currentValue);
        // You can also use categoryId.previousValue and 
        // categoryId.firstChange for comparing old and new values
    }
}