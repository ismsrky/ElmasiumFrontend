import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Comp
import { PersonAccountSearchListIndexComp } from './list/index.comp';
import { PersonAccountSearchCriteriaComp } from './criteria/criteria.comp';

// Service
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';

// Dto
import { PersonAccountListDto } from '../../../../dto/person/account/list.dto';
import { PersonAccountSearchShowCriteriaBo } from '../../../../bo/person/account/search-show-criteria.bo';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { UtilService } from '../../../../service/sys/util.service';

@Component({
    selector: 'person-account-search-index',
    templateUrl: './index.comp.html'
})
export class PersonAccountSearchIndexComp implements OnInit, OnDestroy {
    criteriaBo: PersonAccountSearchShowCriteriaBo;

    itemSelectedSubscription: Subscription;

    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;
    @ViewChild(PersonAccountSearchListIndexComp, { static: false }) childSearchListIndex: PersonAccountSearchListIndexComp;
    @ViewChild(PersonAccountSearchCriteriaComp, { static: false }) childSearchCriteria: PersonAccountSearchCriteriaComp;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {
        this.criteriaBo = new PersonAccountSearchShowCriteriaBo();
    }

    ngOnInit(): void {
        this.itemSelectedSubscription = this.compBroadCastService.getMessage<PersonAccountListDto>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                const list: PersonAccountListDto[] = [];
                list.push(x);

                this._eventBus.next(list);
                this.modal.hide();
            }
        );

    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.itemSelectedSubscription);
    }
    private _eventBus: Subject<PersonAccountListDto[]>;

    showModal(criteriaBo: PersonAccountSearchShowCriteriaBo): Observable<PersonAccountListDto[]> {
        this.criteriaBo = criteriaBo;

        this.childSearchListIndex.criteriaBo = this.criteriaBo;
        this.childSearchCriteria.show(this.criteriaBo);

        this._eventBus = new Subject<PersonAccountListDto[]>();

        //this.modal.config = this.config;
        //this.personAccountDto = new PersonAccountDto();

        let subscribeModalClosed = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeModalClosed);

                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonAccountSearch');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    ok(): void {
        if (this.utils.isNull(this.childSearchListIndex.accountList) || this.childSearchListIndex.accountList.length == 0) {
            this._eventBus.next(null);
            this.modal.hide();
            return;
        }

        /**
         *   if (this.utils.isNull(this.childSearchListIndex.accountList) || this.utils.isNull(this.childSearchListIndex.accountList.find(f => f.Checked)) {
            this.dialogService.show({
                text: this.dicService.getValue('xSelectAnItem'),
                icon: DialogIcons.Warning,
                buttons: DialogButtons.OK,
                closeIconVisible: true
            });
            return;
        }
         */

        const checkedList: PersonAccountListDto[] = this.childSearchListIndex.accountList.filter(f => f.Checked);

        this._eventBus.next(checkedList);
        this.modal.hide();
    }
}