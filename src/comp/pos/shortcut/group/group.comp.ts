import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';

// Service
import { PosService } from '../../../../service/pos/pos.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';

// Dto
import { PosProductShortCutGroupListDto } from '../../../../dto/pos/product-shortcut-group-list.dto';
import { PosProductShortCutGroupDto } from '../../../../dto/pos/product-shortcut-group.dto';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { Stc } from '../../../../stc';
import { UtilService } from '../../../../service/sys/util.service';

@Component({
    selector: 'pos-shortcut-group',
    templateUrl: './group.comp.html'
})
export class PosShortCutGroupComp implements OnInit, OnDestroy {
    constructor(
        private posService: PosService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private utils: UtilService) {
        this.groupDto = new PosProductShortCutGroupDto();
    }
    @ViewChild(ModalDirective, {static: false}) modal: ModalDirective;
    @ViewChild('shortcutGroupForm', { static: false }) shortcutGroupForm: NgForm;

    busy: boolean = false;

    groupDto: PosProductShortCutGroupDto;
    private _eventBus: Subject<PosProductShortCutGroupListDto>;

    ngOnDestroy(): void {
    }
    ngOnInit(): void {
    }

    showModal(groupDto: PosProductShortCutGroupDto): Observable<PosProductShortCutGroupListDto> {
        //this.personAccountForm.resetForm();
        this._eventBus = new Subject<PosProductShortCutGroupListDto>();

        this.groupDto = groupDto;
        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                subscribeCloseModal.unsubscribe();

                if (this._eventBus != null) {
                    this._eventBus.unsubscribe();
                    this._eventBus = null;
                }

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PosProductShortCutGroup');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    save(): void {
        if (this.shortcutGroupForm.invalid) {
            return;
        }
        if (this.shortcutGroupForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        let subscribeSave = this.posService.saveShortCutgroup(this.groupDto).subscribe(
            x => {
                this.utils.unsubs(subscribeSave);

                if (x.IsSuccess) {
                    this.groupDto.Id = x.ReturnedId;                    

                    this._eventBus.next(null);

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                    this.modal.hide();
                } else {
                    this.toastr.error(x.Message);
                }
            },
            err => {
                this.utils.unsubs(subscribeSave);
                this.toastr.error(err);
            }
        );
    }

}