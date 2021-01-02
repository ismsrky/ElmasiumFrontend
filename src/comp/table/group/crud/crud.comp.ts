import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CurrencyMaskConfig } from 'ngx-currency';

// Service
import { PersonTableService } from '../../../../service/person/table.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonTableGroupGetCriteriaDto } from '../../../../dto/person/table/group-get-criteria.dto';
import { PersonTableGroupDto } from '../../../../dto/person/table/group.dto';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { PersonTableGroupStats } from '../../../../enum/person/table-group-stats.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'table-group-crud',
    templateUrl: './crud.comp.html',
    animations: [expandCollapse]
})
export class TableGroupCrudComp implements OnInit, OnDestroy {
    groupDto: PersonTableGroupDto;

    @ViewChild('tableGroupForm', { static: false }) tableGroupForm: NgForm;

    tableGroupStats = PersonTableGroupStats;

    configQuantity: CurrencyMaskConfig;

    busy: boolean = false;
    constructor(
        private personTableService: PersonTableService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.groupDto = new PersonTableGroupDto();

        this.configQuantity = this.utils.getQuantityMaskOptions();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    // call this method.
    // id: for update the record. null means new record.
    // personId: the shop id.
    show(id: number, personId: number, orderMax: number = 0): void {
        this.groupDto = new PersonTableGroupDto();
        if (this.utils.isNull(id)) {
            this.groupDto.PersonId = personId;
            this.groupDto.Order = orderMax;
        } else {
            this.loadData(id);
        }
    }

    private loadData(id: number): void {
        this.busy = true;

        const criteriaDto = new PersonTableGroupGetCriteriaDto();
        criteriaDto.Id = id;
        let subs = this.personTableService.getGroup(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.groupDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;;
            }
        );
    }

    save(): void {
        if (this.tableGroupForm.invalid) {
            return;
        }
        if (this.tableGroupForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        let subscribeSave = this.personTableService.saveGroup(this.groupDto).subscribe(
            x => {
                this.utils.unsubs(subscribeSave);

                if (x.IsSuccess) {
                    this.groupDto.Id = x.ReturnedId;

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({
                        'TableGroupCrudComp': {
                            'groupDto': this.groupDto
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
            'TableGroupCrudComp': {
                'groupDto': this.groupDto
            }
        }));
    }
}