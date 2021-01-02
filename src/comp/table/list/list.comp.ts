import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { TableCrudComp } from '../crud/crud.comp';

// Service
import { PersonTableService } from '../../../service/person/table.service';
import { PersonRelationService } from '../../../service/person/relation.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { UtilService } from '../../../service/sys/util.service';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Dto
import { PersonTableGetListCriteriaDto } from '../../../dto/person/table/getlist-criteria.dto';
import { PersonTableListDto } from '../../../dto/person/table/list.dto';
import { PersonTableStats } from '../../../enum/person/table-stats.enum';
import { PersonTableDto } from '../../../dto/person/table/table.dto';
import { PersonTableDeleteDto } from '../../../dto/person/table/delete.dto';
import { PersonTableGroupDto } from '../../../dto/person/table/group.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { RelationTypes } from '../../../enum/person/relation-types.enum';
import { expandCollapse } from '../../../stc';
import { LogExceptionService } from '../../../service/log/exception.service';

@Component({
    selector: 'table-list',
    templateUrl: './list.comp.html',
    animations: [expandCollapse]
})
export class TableListComp implements OnInit, OnDestroy {
    criteriaDto: PersonTableGetListCriteriaDto;
    listDto: PersonTableListDto[];

    isCrudOpen: boolean = false;

    @ViewChild(TableCrudComp, { static: false }) childTableCrudComp: TableCrudComp;

    subsItemSelected: Subscription;
    subsSaved: Subscription;
    subscriptionModalClosed: Subscription;
    subsNeedRefresh: Subscription;

    profile: PersonProfileBo;

    groupId: number = null;
    shopId: number = null;

    isShopOwner: boolean = false;

    busy: boolean = false;
    constructor(
        private personTableService: PersonTableService,
        private personRelationService: PersonRelationService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private localStorageService: LocalStorageService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
        this.listDto = [];

        this.criteriaDto = new PersonTableGetListCriteriaDto();
        this.criteriaDto.PersonTableStatId = PersonTableStats.xAvailable;
    }

    ngOnInit(): void {
        this.subsItemSelected = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('TableGroupListComp')) {
                        const data = JSON.parse(x).TableGroupListComp;
                        const groupDto: PersonTableGroupDto = data.groupDto;
                        const shopId: number = data.shopId;

                        this.shopId = shopId;

                        if (this.utils.isNull(groupDto)) {
                            this.groupId = null;

                            this.listDto = [];
                        } else {
                            this.groupId = groupDto.Id;

                            this.checkPermission();

                            this.loadData();
                        }
                    }
                }
            });
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('TableCrudComp')) {
                        const tableDto: PersonTableDto = JSON.parse(x).TableCrudComp.tableDto;

                        this.isCrudOpen = false;
                        this.loadData();
                    }
                }
            });

        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('TableCrudComp')) {
                        const tableDto: PersonTableDto = JSON.parse(x).TableCrudComp.tableDto;

                        this.isCrudOpen = false;
                    }
                }
            });
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsItemSelected);
        this.utils.unsubs(this.subsSaved);
        this.utils.unsubs(this.subscriptionModalClosed);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    private loadData(): void {
        this.busy = true;

        this.criteriaDto.GroupId = this.groupId;

        let subs = this.personTableService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.listDto = x.Dto;
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

    openCrud(id: number): void {
        this.isCrudOpen = true;

        let orderMax: number = 0;
        if (this.utils.isNull(id) && this.utils.isNotNull(this.listDto) && this.listDto.length > 0) {
            this.listDto.forEach(element => {
                if (element.Order > orderMax) {
                    orderMax = element.Order;
                }
            });
        }

        setTimeout(() => {
            this.childTableCrudComp.show(id, this.criteriaDto.GroupId, orderMax + 1);
        }, 200);
    }

    delete(id: number): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const deleteDto = new PersonTableDeleteDto();
                deleteDto.Id = id;
                this.busy = true;
                let subs = this.personTableService.delete(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.loadData();
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'delete', subs);
                this.busy = false;
                    }
                );
            }
        });
    }

    checkPermission(): void {
        let subs = this.personRelationService.has(RelationTypes.xShopOwner, this.shopId).subscribe(
            x => {
                this.utils.unsubs(subs);

                this.isShopOwner = x.IsSuccess;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'checkPermission', subs);
            }
        );
    }
}