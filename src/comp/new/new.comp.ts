import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { PersonNewShopCrudComp } from '../person/new/shop/shop.comp';
import { FicheCrudComp } from '../fiche/crud/crud.comp';
import { PageTitleComp } from '../general/page-title/page-title.comp';

// Service
import { AuthService } from '../../service/auth/auth.service';
import { CompBroadCastService } from '../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../service/log/exception.service';
import { UtilService } from '../../service/sys/util.service';

// Dto
import { FicheListDto } from '../../dto/fiche/list.dto';
import { FicheGetListCriteriaDto } from '../../dto/fiche/getlist-criteria.dto';

// Enum
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { FicheTypes } from '../../enum/fiche/types.enum';
import { FicheContents } from '../../enum/fiche/contents.enum';
import { FicheTypeFakes } from '../../enum/fiche/type-fakes.enum';
import { expandCollapse } from '../../stc';

@Component({
    selector: 'mh-new',
    templateUrl: './new.comp.html',
    animations: [expandCollapse]
})
export class NewComp implements OnInit, OnDestroy {
    constructor(
        private compBroadCastService: CompBroadCastService,
        private authService: AuthService,
        private utils: UtilService,
        private logExService: LogExceptionService) {
        this.ficheListDto = [];
    }

    @Input('IsInside') IsInside: boolean = false;
    @Input('ShowNewFiche') ShowNewFiche: boolean = true;
    @Input('ShowNewProfile') ShowNewProfile: boolean = true;

    @ViewChild(FicheCrudComp, { static: false }) childFicheCrud: FicheCrudComp;
    @ViewChild(PersonNewShopCrudComp, { static: false }) personNewShopCrudComp: PersonNewShopCrudComp;

    criteriaDto: FicheGetListCriteriaDto;
    ficheListDto: FicheListDto[];

    isFicheOpen: boolean = false;
    isNewShopOpen: boolean = false;

    subscriptionModalClosed: Subscription;

    ficheTypes = FicheTypes;
    ficheTypeFakes = FicheTypeFakes;

    busy: boolean = false;

    ngOnInit(): void {
        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'FicheCrudComp') {
                    this.isFicheOpen = false;
                } else if (x == 'PersonNewShopCrudComp') {
                    this.isNewShopOpen = false;
                }
            }
        );

        /**
         * try {
            throw new Error('Something bad happened');
        } catch (error) {
            let subscribeSave = this.logExService.saveEx(error, 'AuthLoginComp', 'ngOnInit').subscribe(
                x=>{
                    this.utils.unsubs(subscribeSave);
                },
                err=>{

                });
        }
         */
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionModalClosed);
    }

    hata(): void {
        try {
            throw new Error('Something bad happened');
        } catch (error) {

            //this.logExService.saveEx(error, this.constructor.name, 'hata');
            

        

            
        }

        throw new Error('Something very bad happened');
    }

    openFiche(id: number, ficheTypeFakeId: FicheTypeFakes): void {
        if (!this.authService.handleRealLoginRequired()) return;

        setTimeout(() => {
            this.isFicheOpen = false;

            setTimeout(() => {
                this.isFicheOpen = true;

                setTimeout(() => {
                    this.childFicheCrud.show(id, ficheTypeFakeId, FicheContents.xStartingBalance);
                });
            });
        });
    }

    openNewShop(): void {
        if (!this.authService.handleRealLoginRequired()) return;

        setTimeout(() => {
            this.isNewShopOpen = false;

            setTimeout(() => {
                this.isNewShopOpen = true;

                setTimeout(() => {
                    this.personNewShopCrudComp.showModal();
                });
            });
        });
    }
}