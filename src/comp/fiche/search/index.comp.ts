import { Component, OnInit, OnDestroy, ViewChild, Host } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Services
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';

// Dto
import { FicheListDto } from '../../../dto/fiche/list.dto';

// Bo
import { FicheSearchShowCriteriaBo } from '../../../bo/fiche/search-show-criteria.bo';

//Components
import { FicheSearchListIndexComp } from './list/index.comp';
import { FicheSearchCriteriaComp } from './criteria/criteria.comp';

// Enums
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { Stc } from '../../../stc';
import { UtilService } from '../../../service/sys/util.service';

@Component({
    selector: 'fiche-search-index',
    templateUrl: './index.comp.html'
})
export class FicheSearchIndexComp implements OnInit, OnDestroy {
    criteriaBo: FicheSearchShowCriteriaBo;

    itemSelectedSubscription: Subscription;

    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;
    @ViewChild(FicheSearchListIndexComp, { static: false }) childSearchListIndex: FicheSearchListIndexComp;
    @ViewChild(FicheSearchCriteriaComp, { static: false }) childSearchCriteria: FicheSearchCriteriaComp;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {
        this.criteriaBo = new FicheSearchShowCriteriaBo();
    }

    ngOnInit(): void {
        //
        this.itemSelectedSubscription = this.compBroadCastService.getMessage<FicheListDto>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                const list: FicheListDto[] = [];
                list.push(x);

                this._eventBus.next(list);
                this.modal.hide();
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.itemSelectedSubscription);
    }
    private _eventBus: Subject<FicheListDto[]>;

    showModal(criteriaBo: FicheSearchShowCriteriaBo): Observable<FicheListDto[]> {
        this.criteriaBo = criteriaBo;

        this.childSearchListIndex.criteriaBo = this.criteriaBo;
        this.childSearchCriteria.show(this.criteriaBo);

        this._eventBus = new Subject<FicheListDto[]>();


        this.modal.onHide.subscribe(
            x => {
                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'FicheSearch');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    ok(): void {
        if (this.utils.isNull(this.childSearchListIndex.ficheListDto) || this.childSearchListIndex.ficheListDto.length == 0) {
            this._eventBus.next(null);
            this.modal.hide();
            return;
        }

        const checkedList: FicheListDto[] = this.childSearchListIndex.ficheListDto.filter(f => f.Checked);

        this._eventBus.next(checkedList);
        this.modal.hide();
    }
}