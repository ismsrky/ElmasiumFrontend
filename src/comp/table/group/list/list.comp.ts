import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { TableGroupCrudComp } from '../crud/crud.comp';

// Service
import { PersonTableService } from '../../../../service/person/table.service';
import { PersonRelationService } from '../../../../service/person/relation.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Dto
import { PersonTableGroupGetListCriteriaDto } from '../../../../dto/person/table/group-getlist-criteria.dto';
import { PersonTableGroupListDto } from '../../../../dto/person/table/group-list.dto';
import { PersonTableGroupDto } from '../../../../dto/person/table/group.dto';
import { PersonTableGroupDeleteDto } from '../../../../dto/person/table/group-delete.dto';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { PersonTableGroupStats } from '../../../../enum/person/table-group-stats.enum';
import { RelationTypes } from '../../../../enum/person/relation-types.enum';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'table-group-list',
    templateUrl: './list.comp.html',
    animations: [expandCollapse]
})
export class TableGroupListComp implements OnInit, OnDestroy {
    criteriaDto: PersonTableGroupGetListCriteriaDto;
    listDto: PersonTableGroupListDto[];

    selected: PersonTableGroupListDto = null;

    tableGroupStats = PersonTableGroupStats;

    isCrudOpen: boolean = false;

    @ViewChild(TableGroupCrudComp, { static: false }) childTableGroupCrudComp: TableGroupCrudComp;

    subsSaved: Subscription;
    subscriptionModalClosed: Subscription;
    subsNeedRefresh: Subscription;

    profile: PersonProfileBo;

    shopId: number;

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

        this.shopId = this.profile.PersonId;
        this.listDto = [];

        this.criteriaDto = new PersonTableGroupGetListCriteriaDto();
        this.criteriaDto.PersonId = this.shopId;
        this.criteriaDto.PersonTableGroupStatId = PersonTableGroupStats.xAvailable;

        this.show();

        this.checkPermission();
    }

    ngOnInit(): void {
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('TableGroupCrudComp')) {
                        const groupDto: PersonTableGroupDto = JSON.parse(x).TableGroupCrudComp.groupDto;

                        this.isCrudOpen = false;
                        this.loadData(groupDto.Id);
                    }
                }
            });

        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('TableGroupCrudComp')) {
                        const groupDto: PersonTableGroupDto = JSON.parse(x).TableGroupCrudComp.groupDto;

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
        this.utils.unsubs(this.subsSaved);
        this.utils.unsubs(this.subscriptionModalClosed);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    // call this method
    show(): void {
        this.loadData(null);
    }

    private loadData(selectedId: number): void {
        this.busy = true;
        let subs = this.personTableService.getGroupList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.listDto = x.Dto;

                    if (this.utils.isNotNull(this.listDto) && this.listDto.length > 0) {
                        if (this.utils.isNull(this.selected)) {
                            this.select(this.listDto[0]);
                        } else {
                            let i: number = 0;
                            let found: boolean = false;
                            this.listDto.forEach(element => {
                                i++;

                                if (element.Id == this.selected.Id || (this.utils.isNotNull(selectedId) && element.Id == selectedId)) {
                                    this.select(element);
                                    found = true;
                                }

                                if (i == this.listDto.length && !found) {
                                    this.select(this.listDto[0]);
                                }
                            });
                        }
                    } else {
                        this.select(null);
                    }
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

    select(listItem: PersonTableGroupListDto): void {
        this.selected = listItem;

        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, JSON.stringify({
            'TableGroupListComp': {
                'groupDto': this.selected,
                'shopId': this.shopId
            }
        }));
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
            this.childTableGroupCrudComp.show(id, this.criteriaDto.PersonId, orderMax + 1);
        }, 200);
    }

    delete(id: number): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const deleteDto = new PersonTableGroupDeleteDto();
                deleteDto.Id = id;
                this.busy = true;
                let subs = this.personTableService.deleteGroup(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;
                        
                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.loadData(null);
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