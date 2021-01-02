import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

// Service
import { WarningService } from '../../../service/warning/warning.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { WarningDto } from '../../../dto/warning/warning.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { WarningModuleTypes } from '../../../enum/warning/module-types.enum';
import { WarningTypes } from '../../../enum/warning/types.enum';

@Component({
    selector: 'warning-crud',
    templateUrl: './crud.comp.html'
})
export class WarningCrudComp implements OnInit, OnDestroy {
    @ViewChild('warningForm', { static: false }) warningForm: NgForm;
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    busy: boolean = false;
    warningDto: WarningDto;

    refId: number;

    warningTypes = WarningTypes;
    constructor(
        private warningService: WarningService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.warningDto = new WarningDto();
    }

    showModal(warningModuleTypeId: WarningModuleTypes, refId: number): void {
        this.refId = refId;

        this.warningDto = new WarningDto();
        this.warningDto.WarningModuleTypeId = warningModuleTypeId;

        switch (warningModuleTypeId) {
            case WarningModuleTypes.PersonProduct:
                this.warningDto.PersonProductId = refId;
                break;
            case WarningModuleTypes.Comment:
                this.warningDto.CommentId = refId;
                break;
            case WarningModuleTypes.Person:
                this.warningDto.PersonId = refId;
                break;
        }

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'WarningCrudComp');
            }
        );

        this.modal.show();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    save(): void {
        if (this.warningForm.invalid) {
            return;
        }
        if (this.warningForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }

        this.busy = true;
        let subs = this.warningService.save(this.warningDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.toastr.success(this.dicService.getValue('xThanksFeedBack'));

                    this.close();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;
            }
        );
    }
    close(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'WarningCrudComp');
    }
}