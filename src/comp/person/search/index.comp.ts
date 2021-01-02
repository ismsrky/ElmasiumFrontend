import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Comp
import { PersonSearchListIndexComp } from './list/index.comp';
import { PersonSearchCriteriaComp } from './criteria/criteria.comp';

// Service
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';

// Dto
import { PersonRelationListDto } from '../../../dto/person/relation/list.dto';

// Bo
import { PersonSearchShowCriteriaBo } from '../../../bo/person/search-show-criteria.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { Stc, expandCollapseHidden } from '../../../stc';
import { UtilService } from '../../../service/sys/util.service';

@Component({
    selector: 'person-search-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapseHidden]
})
export class PersonSearchIndexComp implements OnInit, OnDestroy {
    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
    isNarrow: boolean = false;

    captionStr: string = '';
    criteriaBo: PersonSearchShowCriteriaBo;

    subsItemSelected: Subscription;

    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;
    @ViewChild(PersonSearchListIndexComp, { static: false }) childSearchListIndex: PersonSearchListIndexComp;
    @ViewChild(PersonSearchCriteriaComp, { static: false }) childSearchCriteria: PersonSearchCriteriaComp;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {
        this.criteriaBo = new PersonSearchShowCriteriaBo();

        this.isNarrow = window.innerWidth <= 768;
    }

    ngOnInit(): void {
        this.subsItemSelected = this.compBroadCastService.getMessage<PersonRelationListDto>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                const list: PersonRelationListDto[] = [];
                list.push(x);

                this._eventBus.next(list);
                this.modal.hide();
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsItemSelected);
    }

    private _eventBus: Subject<PersonRelationListDto[]>;
    showModal(criteriaBo: PersonSearchShowCriteriaBo): Observable<PersonRelationListDto[]> {
        this.criteriaBo = criteriaBo;

        this.captionStr = this.criteriaBo.IsOppositeOperation ? 'xSearchConnection' : 'xMyProfiles';

        this.childSearchListIndex.show(this.criteriaBo);
        this.childSearchCriteria.show(this.criteriaBo);

        this._eventBus = new Subject<PersonRelationListDto[]>();

        this.modal.onHide.subscribe(
            x => {
                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonSearch');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    ok(): void {
        if (this.utils.isNull(this.childSearchListIndex.relationList) || this.childSearchListIndex.relationList.length == 0) {
            this._eventBus.next(null);
            this.modal.hide();
            return;
        }

        const checkedList: PersonRelationListDto[] = this.childSearchListIndex.relationList.filter(f => f.Checked);

        this._eventBus.next(checkedList);
        this.modal.hide();
    }
}