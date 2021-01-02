import { Component, OnInit, OnDestroy, Input, HostListener, Host } from '@angular/core';

// Dto
import { FicheProductListDto } from '../../../../../dto/fiche/product/list.dto';
import { CurrenciesDto } from '../../../../../dto/enumsOp/currencies.dto';
import { FicheListDto } from '../../../../../dto/fiche/list.dto';
import { FicheActionsDto } from '../../../../../dto/fiche/actions.dto';
import { PersonTypes } from '../../../../../enum/person/person-types.enum';
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { CommentService } from '../../../../../service/comment/comment.service';
import { ProductTypes } from '../../../../../enum/product/types.enum';
import { FicheListItemComp } from '../item.comp';

@Component({
    selector: 'fiche-list-item-product-list',
    templateUrl: './product-list.comp.html'
})
export class FicheListItemProductListComp implements OnInit, OnDestroy {
    @Input('ficheProductList') ficheProductList: FicheProductListDto[];
    @Input('ficheListDto') ficheListDto: FicheListDto;

    @Input('ficheActionsDto') ficheActionsDto: FicheActionsDto;

    host: FicheListItemComp;

    profile: PersonProfileBo;

    isNarrow: boolean = true;

    personTypes = PersonTypes;

    constructor(
        @Host() host: FicheListItemComp,
        private localStorageService: LocalStorageService) {
        this.host = host;

        this.profile = this.localStorageService.personProfile;

        this.onResize();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 992; // md
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}