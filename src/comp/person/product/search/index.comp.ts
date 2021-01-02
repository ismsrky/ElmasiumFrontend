import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Comp
import { PersonProductSearchListIndexComp } from './list/index.comp';
import { PersonProductSearchCriteriaComp } from './criteria/criteria.comp';

// Service
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonProductListDto } from '../../../../dto/person/product/list.dto';

// Bo
import { PersonProductSearchShowCriteriaBo } from '../../../../bo/person/product/search-show-criteria.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'person-product-search-index',
    templateUrl: './index.comp.html'
})
export class PersonProductSearchIndexComp implements OnInit, OnDestroy {
    criteriaBo: PersonProductSearchShowCriteriaBo;

    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;
    @ViewChild(PersonProductSearchListIndexComp, { static: false }) childSearchListIndex: PersonProductSearchListIndexComp;
    @ViewChild(PersonProductSearchCriteriaComp, { static: false }) childSearchCriteria: PersonProductSearchCriteriaComp;

    itemSelectedSubscription: Subscription;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {
        this.criteriaBo = new PersonProductSearchShowCriteriaBo();
    }

    ngOnInit(): void {
        this.itemSelectedSubscription = this.compBroadCastService.getMessage<PersonProductListDto>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                const list: PersonProductListDto[] = [];
                list.push(x);

                this._eventBus.next(list);
                this.modal.hide();
            }
        );

    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.itemSelectedSubscription);
    }
    private _eventBus: Subject<PersonProductListDto[]>;

    showModal(criteriaBo: PersonProductSearchShowCriteriaBo): Observable<PersonProductListDto[]> {
        this.criteriaBo = criteriaBo;

        this.childSearchListIndex.criteriaBo = this.criteriaBo;
        this.childSearchCriteria.show(this.criteriaBo);

        this._eventBus = new Subject<PersonProductListDto[]>();


        this.modal.onHide.subscribe(
            x => {
                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonProductSearch');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    ok(): void {
        if (this.utils.isNull(this.childSearchListIndex.productList) || this.childSearchListIndex.productList.length == 0) {
            this._eventBus.next(null);
            this.modal.hide();
            return;
        }

        const checkedList: PersonProductListDto[] = this.childSearchListIndex.productList.filter(f => f.Checked);

        this._eventBus.next(checkedList);
        this.modal.hide();
    }
}