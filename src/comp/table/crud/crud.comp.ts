import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CurrencyMaskConfig } from 'ngx-currency';

// Service
import { PersonTableService } from '../../../service/person/table.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PersonTableGetCriteriaDto } from '../../../dto/person/table/get-criteria.dto';
import { PersonTableDto } from '../../../dto/person/table/table.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { PersonTableStats } from '../../../enum/person/table-stats.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'table-crud',
    templateUrl: './crud.comp.html',
    animations: [expandCollapse]
})
export class TableCrudComp implements OnInit, OnDestroy {
    tableDto: PersonTableDto;

    @ViewChild('tableForm', { static: false }) tableForm: NgForm;

    tableStats = PersonTableStats;

    configPositiveInt: CurrencyMaskConfig;

    busy: boolean = false;
    constructor(
        private personTableService: PersonTableService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.tableDto = new PersonTableDto();

        this.configPositiveInt = this.utils.getPositiveIntMaskOptions();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    // call this method.
    // id: for update the record. null means new record.
    // personId: the shop id.
    show(id: number, groupId: number, orderMax: number = 0): void {
        this.tableDto = new PersonTableDto();
        if (this.utils.isNull(id)) {
            this.tableDto.GroupId = groupId;
            this.tableDto.Order = orderMax;
        } else {
            this.loadData(id);
        }
    }

    private loadData(id: number): void {
        this.busy = true;

        const criteriaDto = new PersonTableGetCriteriaDto();
        criteriaDto.Id = id;
        let subs = this.personTableService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.tableDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    save(): void {
        if (this.tableForm.invalid) {
            return;
        }
        if (this.tableForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        let subscribeSave = this.personTableService.save(this.tableDto).subscribe(
            x => {
                this.utils.unsubs(subscribeSave);

                if (x.IsSuccess) {
                    this.tableDto.Id = x.ReturnedId;

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({
                        'TableCrudComp': {
                            'tableDto': this.tableDto
                        }
                    }));

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.utils.unsubs(subscribeSave);
                this.toastr.error(err);
            }
        );
    }

    cancel(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, JSON.stringify({
            'TableCrudComp': {
                'tableDto': this.tableDto
            }
        }));
    }
}