import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subject, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Service
import { PropertyService } from '../../../service/property/property.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PropertySaveDto } from '../../../dto/property/save.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'property-crud',
    templateUrl: './crud.comp.html'
})
export class PropertyCrudComp implements OnInit, OnDestroy {
    @ViewChild('propertySaveForm', { static: false }) propertySaveForm: NgForm;
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    busy: boolean = false;
    propertySaveDto: PropertySaveDto;

    productCategoryId: number;

    private _eventBus: Subject<number>;
    constructor(
        private propertyService: PropertyService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.propertySaveDto = new PropertySaveDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(productCategoryId: number): Observable<number> {
        this._eventBus = new Subject<number>();

        this.productCategoryId = productCategoryId;

        this.propertySaveDto = new PropertySaveDto();
        this.propertySaveDto.ProductCategoryId = this.productCategoryId;

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PropertyCrudComp');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    save(): void {
        if (this.propertySaveForm.invalid) {
            return;
        }
        if (this.propertySaveForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }

        this.busy = true;
        let subs = this.propertyService.save(this.propertySaveDto).subscribe(
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
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PropertyCrudComp');
    }
}

// Notes: This comp is smilar to 'OptionCrudComp'