import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Service
import { OptionService } from '../../../service/option/option.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { OptionSaveDto } from '../../../dto/option/save.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'option-crud',
    templateUrl: './crud.comp.html'
})
export class OptionCrudComp implements OnInit, OnDestroy {
    @ViewChild('optionSaveForm', { static: false }) optionSaveForm: NgForm;
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    busy: boolean = false;
    optionSaveDto: OptionSaveDto;

    productCategoryId: number;

    private _eventBus: Subject<number>;
    constructor(
        private optionService: OptionService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.optionSaveDto = new OptionSaveDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(productCategoryId: number): Observable<number> {
        this._eventBus = new Subject<number>();

        this.productCategoryId = productCategoryId;

        this.optionSaveDto = new OptionSaveDto();
        this.optionSaveDto.ProductCategoryId = this.productCategoryId;

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'OptionCrudComp');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    save(): void {
        if (this.optionSaveForm.invalid) {
            return;
        }
        if (this.optionSaveForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }

        this.busy = true;
        let subs = this.optionService.save(this.optionSaveDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this._eventBus.next(x.ReturnedId);

                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));

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
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'OptionCrudComp');
    }
}

// Notes: This comp is smilar to 'PropertyCrudComp'