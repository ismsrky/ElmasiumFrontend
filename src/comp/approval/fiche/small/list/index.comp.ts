import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { ApprovalFicheChoiceIndexComp } from '../../choice/index.comp';

// Service
import { ApprovalFicheService } from '../../../../../service/approval/fiche.service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { ApprovalFicheListDto } from '../../../../../dto/approval/fiche/list.dto';
import { ApprovalFicheGetListCriteriaDto } from '../../../../../dto/approval/fiche/getlist-criteria.dto';
import { PersonNotificationSummaryDto } from '../../../../../dto/person/notification-summary.dto';

// Bo
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { Stc, expandCollapse } from '../../../../../stc';

@Component({
    selector: 'approval-fiche-small-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class ApprovalFicheSmallListIndexComp implements OnInit, OnDestroy {
    profile: PersonProfileBo;

    subsNeedRefresh: Subscription;

    isNarrow: boolean = true;

    busy: boolean = false;
    approvalFicheList: ApprovalFicheListDto[];
    getIncomings: boolean = true; // do not reach directly. Use 'loadData' void.
    outgoingCount: number = 0;

    notificationSummaryDto: PersonNotificationSummaryDto;

    showFicheItem: boolean = false;

    @ViewChild(ApprovalFicheChoiceIndexComp, { static: false }) childFicheChoiceComp: ApprovalFicheChoiceIndexComp;

    constructor(
        private approvalFicheService: ApprovalFicheService,
        private dialogService: DialogService,
        private compBroadCastService: CompBroadCastService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.notificationSummaryDto = Stc.notificationSummaryDto;

        this.profile = this.localStorageService.personProfile;
    }

    ngOnInit(): void {
        this.isNarrow = window.innerWidth <= 768;

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                } else if (x == 'PersonNotificationSummary') {
                    this.notificationSummaryDto = Stc.notificationSummaryDto;
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    loadData(getIncomings: boolean): void {
        this.getIncomings = getIncomings;

        this.busy = true;

        const criteriaDto = new ApprovalFicheGetListCriteriaDto();
        criteriaDto.MyPersonId = this.profile.PersonId;
        criteriaDto.GetIncomings = getIncomings;

        let subs = this.approvalFicheService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.approvalFicheList = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;

                this.approvalFicheList = [];
            }
        );
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}

// Notes
// I did not add paging here intentionally because I thought there would not be so much approval fiches.
// If sometimes count of approval fiches increase about 50, then add here paging.