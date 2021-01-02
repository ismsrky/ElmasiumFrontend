import { Component, OnInit, OnDestroy, Input, Host } from '@angular/core';

// Component
import { FicheSearchListIndexComp } from '../index.comp';

// Dto
import { PersonProductListDto } from '../../../../../dto/person/product/list.dto';

// Enum
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { ProductTypes } from '../../../../../enum/product/types.enum';
import { FicheTypeFakes } from '../../../../../enum/fiche/type-fakes.enum';
import { FicheListDto } from '../../../../../dto/fiche/list.dto';

@Component({
    selector: 'fiche-search-list-item',
    templateUrl: './item.comp.html'
})
export class FicheSearchListItemComp implements OnInit, OnDestroy {
    constructor(
        private compBroadCastService: CompBroadCastService,
        @Host() host: FicheSearchListIndexComp) {
        this.host = host;
    }
    host: FicheSearchListIndexComp;
    @Input('listItem') listItem: FicheListDto;

    ficheTypeFakes = FicheTypeFakes;

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
    selectItem(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, this.listItem);
    }
}