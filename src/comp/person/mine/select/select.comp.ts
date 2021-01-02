import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

// Service
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonRelationListDto } from '../../../../dto/person/relation/list.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'person-mine-select',
    templateUrl: './select.comp.html'
})
export class PersonMineSelectComp implements OnInit {
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    myPersonList: PersonRelationListDto[];

    selectedProfileId: number;

    busy: boolean = false;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {
        this.selectedProfileId = null;
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
    }

    showModal(myPersonList: PersonRelationListDto[]): void {
        this.myPersonList = myPersonList;

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                subscribeCloseModal.unsubscribe();

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonMineSelect');
            }
        );

        this.modal.show();
    }

    myPersonChanged(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, JSON.stringify({ 'myPersonChanged': { 'selectedProfileId': this.selectedProfileId } }));
        this.modal.hide();
    }
}