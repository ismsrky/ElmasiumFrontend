import { Component, OnInit, OnDestroy } from '@angular/core';

// Service
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';

// Dto

// Bo

// Enums
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { ProductTypes } from '../../../../enum/product/types.enum';
import { StockStats } from '../../../../enum/product/stock-stats-.enum';
import { FicheSearchShowCriteriaBo } from '../../../../bo/fiche/search-show-criteria.bo';
import { FicheGetListCriteriaDto } from '../../../../dto/fiche/getlist-criteria.dto';

@Component({
    selector: 'fiche-search-criteria',
    templateUrl: './criteria.comp.html'
})
export class FicheSearchCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: FicheGetListCriteriaDto;
    criteriaBo: FicheSearchShowCriteriaBo;

    productTypes = ProductTypes;
    stockStats = StockStats;

    busy: boolean = false;

    constructor(
        private compBroadCastService: CompBroadCastService) {
        this.criteriaDto = new FicheGetListCriteriaDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    selectionChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'FicheSearchCriteria': this.criteriaDto }));
    }

    show(criteriaBo: FicheSearchShowCriteriaBo): void {
        this.criteriaBo = criteriaBo;

        this.criteriaDto.DebtPersonId = this.criteriaBo.DebtPersonId;
        this.criteriaDto.CreditPersonId = this.criteriaBo.CreditPersonId;


        this.criteriaDto.ExcludingFicheIdList = this.criteriaBo.ExcludingFicheIdList;

        this.selectionChanged();
    }
}