import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { TableGroupListComp } from './group/list/list.comp';

// Service
import { PersonTableService } from '../../service/person/table.service';
import { DictionaryService } from '../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../service/sys/comp-broadcast-service';
import { DialogService } from '../../service/sys/dialog.service';
import { UtilService } from '../../service/sys/util.service';

// Dto
import { PersonTableGroupGetListCriteriaDto } from '../../dto/person/table/group-getlist-criteria.dto';
import { PersonTableGroupListDto } from '../../dto/person/table/group-list.dto';

// Enum
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { PersonTableGroupStats } from '../../enum/person/table-group-stats.enum';
import { expandCollapse } from '../../stc';
import { PersonTableGroupDto } from '../../dto/person/table/group.dto';


@Component({
    selector: 'table-sale', // 'table' occurs some errors in html.
    templateUrl: './table.comp.html',
    animations: [expandCollapse]
})
export class TableComp implements OnInit, OnDestroy {
    busy: boolean = false;
    constructor(
        private personTableService: PersonTableService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private toastr: ToastrService,
        private dialogService: DialogService) {
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}