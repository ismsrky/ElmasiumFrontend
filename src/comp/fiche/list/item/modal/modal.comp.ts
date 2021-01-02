import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Comp
import { FicheListItemComp } from '../item.comp';

// Service
import { FicheService } from '../../../../../service/fiche/fiche.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';

// Dto
import { FicheListDto } from '../../../../../dto/fiche/list.dto';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../../stc';

@Component({
    selector: 'fiche-list-item-modal',
    templateUrl: './modal.comp.html',
    animations: [expandCollapse]
})

export class FicheListItemModalComp implements OnInit, OnDestroy {
    private _eventBus: Subject<FicheListDto[]>;

    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;
    @ViewChild(FicheListItemComp, { static: false }) childFicheItem: FicheListItemComp;

    constructor(private ficheService: FicheService,
        private compBroadCastService: CompBroadCastService,
        private localStorageService: LocalStorageService) {
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(ficheId: number): Observable<FicheListDto[]> {
        this.childFicheItem.showModal(ficheId);

        this._eventBus = new Subject<FicheListDto[]>();

        this.modal.onHide.subscribe(
            x => {
                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'FicheListItemModalComp');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }
}