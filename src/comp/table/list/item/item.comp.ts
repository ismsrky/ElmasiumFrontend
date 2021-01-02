import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { TableListComp } from '../list.comp';

// Service
import { PersonTableService } from '../../../../service/person/table.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { UtilService } from '../../../../service/sys/util.service';

// Bo

// Dto
import { PersonTableListDto } from '../../../../dto/person/table/list.dto';
import { PersonTableStats } from '../../../../enum/person/table-stats.enum';

// Enum
import { expandCollapse } from '../../../../stc';


@Component({
    selector: 'table-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class TableListItemComp implements OnInit, OnDestroy {
    @Input('listItem') listItem: PersonTableListDto;

    host: TableListComp;

    tableStats = PersonTableStats;

    busy: boolean = false;
    constructor(
        @Host() host: TableListComp,
        private personTableService: PersonTableService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private toastr: ToastrService,
        private dialogService: DialogService) {
        this.host = host;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }
}