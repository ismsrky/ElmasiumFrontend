import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

// Service
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';

// Dto
import { PersonProductGetListCriteriaDto } from '../../../../../dto/person/product/getlist-criteria.dto';

// Bo
import { PersonProductSearchShowCriteriaBo } from '../../../../../bo/person/product/search-show-criteria.bo';

// Enums
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { ProductTypes } from '../../../../../enum/product/types.enum';
import { StockStats } from '../../../../../enum/product/stock-stats-.enum';

@Component({
    selector: 'person-product-search-criteria',
    templateUrl: './criteria.comp.html'
})
export class PersonProductSearchCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: PersonProductGetListCriteriaDto;
    criteriaBo: PersonProductSearchShowCriteriaBo;

    productTypes = ProductTypes;
    stockStats = StockStats;

    busy: boolean = false;

    constructor(
        private compBroadCastService: CompBroadCastService) {
        this.criteriaDto = new PersonProductGetListCriteriaDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    selectionChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonProductSearchCriteria': this.criteriaDto }));
    }

    show(criteriaBo: PersonProductSearchShowCriteriaBo): void {
        this.criteriaBo = criteriaBo;

        this.criteriaDto.PersonId = this.criteriaBo.PersonId;
        this.criteriaDto.ProductNameCode = ''; // this empty value provides us to get all products.
        this.selectionChanged();
    }
}