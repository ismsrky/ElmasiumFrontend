import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

// Comp

// Service
import { FicheService } from '../../../service/fiche/fiche.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';

// Dto
import { FicheApprovalHistoryListDto } from '../../../dto/fiche/approval-history-list.dto';
import { FicheApprovalHistoryGetListCriteriaDto } from '../../../dto/fiche/approval-history-getlist-criteria.dto';

// Bo

// Enum
import { Stc, expandCollapse } from '../../../stc';
import { ApprovalStats } from '../../../enum/approval/stats.enum';
import { UtilService } from '../../../service/sys/util.service';
import { LogExceptionService } from '../../../service/log/exception.service';

@Component({
    selector: 'fiche-approval-history-list',
    templateUrl: './approval-history.comp.html',
    animations: [expandCollapse]
})
export class FicheApprovalHistoryListComp implements OnInit, OnDestroy {
    busy: boolean = false;

    historyListDto: FicheApprovalHistoryListDto[];

    approvalStats = ApprovalStats;
    constructor(
        private ficheService: FicheService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private localStorageService: LocalStorageService) {
        this.historyListDto = [];
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(ficheId: number): void {
        this.loadData(ficheId);
    }

    loadData(ficheId: number): void {
        this.busy = true;

        const criteriaDto = new FicheApprovalHistoryGetListCriteriaDto();
        criteriaDto.FicheId = ficheId;

        let subs = this.ficheService.getApprovalHistoryList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.historyListDto = x.Dto;
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
}