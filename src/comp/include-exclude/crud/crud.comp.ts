import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Service
import { IncludeExcludeService } from '../../../service/include-exclude/include-exclude.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { IncludeExcludeSaveDto } from '../../../dto/include-exclude/save.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';


@Component({
    selector: 'include-exclude-crud',
    templateUrl: './crud.comp.html'
})
export class IncludeExcludeCrudComp implements OnInit, OnDestroy {
    @ViewChild('includeExcludeSaveForm', { static: false }) includeExcludeSaveForm: NgForm;
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    includeExcludeSaveDto: IncludeExcludeSaveDto;

    productCategoryId: number = null;
    isInclude: boolean = true;

    private _eventBus: Subject<number>;

    xPlaceholder: string = 'Çıkarılacakları girin';

    busy: boolean = false;
    constructor(
        private includeExcludeService: IncludeExcludeService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.includeExcludeSaveDto = new IncludeExcludeSaveDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(productCategoryId: number, isInclude: boolean): Observable<number> {
        this._eventBus = new Subject<number>();

        this.productCategoryId = productCategoryId;
        this.isInclude = isInclude;

        this.xPlaceholder = isInclude ? 'Ekstraları girin' : 'Çıkarılacakları girin';

        this.includeExcludeSaveDto = new IncludeExcludeSaveDto();
        this.includeExcludeSaveDto.ProductCategoryId = this.productCategoryId;
        this.includeExcludeSaveDto.IsInclude = isInclude;
        this.includeExcludeSaveDto.IncludeExcludeName = null;

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'IncludeExcludeCrudComp');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    save(): void {
        if (this.includeExcludeSaveForm.invalid) {
            return;
        }
        if (this.includeExcludeSaveForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }

        this.busy = true;
        let subs = this.includeExcludeService.saveAll(this.includeExcludeSaveDto).subscribe(
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
        this.modal.hide();
    }
}

// Notes: This comp is smilar to 'PropertyCrudComp'