import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp

// Service
import { ApprovalRelationService } from '../../../../../service/approval/relation.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../service/sys/local-storage.service';
import { PersonRelationService } from '../../../../../service/person/relation.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { ApprovalRelationListDto } from '../../../../../dto/approval/relation/list.dto';
import { ApprovalRelationGetListCriteriaDto } from '../../../../../dto/approval/relation/getlist-criteria.dto';
import { ApprovalRelationSaveDto } from '../../../../../dto/approval/relation/save.dto';
import { PersonNotificationSummaryDto } from '../../../../../dto/person/notification-summary.dto';

// Bo
import { PersonProfileBo } from '../../../../../bo/person/profile.bo';

// Enum
import { ApprovalStats } from '../../../../../enum/approval/stats.enum';
import { DialogIcons } from '../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../enum/sys/dialog/dialog-buttons.enum';
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { RelationTypes } from '../../../../../enum/person/relation-types.enum';
import { Stc, expandCollapse } from '../../../../../stc';

@Component({
    selector: 'approval-relation-small-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class ApprovalRelationSmallListIndexComp implements OnInit, OnDestroy {
    profile: PersonProfileBo;

    subsNeedRefresh: Subscription;

    isNarrow: boolean = true;

    busy: boolean = false;

    notificationSummaryDto: PersonNotificationSummaryDto;

    approvalRelationList: ApprovalRelationListDto[];
    getIncomings: boolean = true; // do not reach directly. Use 'loadData' void.

    constructor(
        private approvalRelationService: ApprovalRelationService,
        private personRelationService: PersonRelationService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {
        this.notificationSummaryDto = Stc.notificationSummaryDto;
        this.profile = this.localStorageService.personProfile;
    }

    ngOnInit(): void {
        this.isNarrow = window.innerWidth <= 768; // md

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
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

        const criteriaDto = new ApprovalRelationGetListCriteriaDto();
        criteriaDto.GetIncomings = getIncomings;
        criteriaDto.MyPersonId = this.profile.PersonId;

        let subs = this.approvalRelationService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.approvalRelationList = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;

                this.approvalRelationList = [];
            }
        );
    }

    save(listItem: ApprovalRelationListDto, approvalStatId: ApprovalStats): void {
        if ((listItem.RelationTypeId == RelationTypes.xShopOwner || listItem.RelationTypeId == RelationTypes.xStaff)
            && !this.personRelationService.hasRelationIn(RelationTypes.xMyShop)) {

            if ((approvalStatId == ApprovalStats.xAccepted || approvalStatId == ApprovalStats.xRejected)
                && this.profile.PersonId == listItem.ChildPersonId) {
            } else {
                this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
                return;
            }
        }

        let strText: string = '';

        if (approvalStatId == ApprovalStats.xAccepted) {
            strText = 'xConfirmRelation';
        } else if (approvalStatId == ApprovalStats.xRejected) {
            strText = 'xConfirmRejectRelation';
        } else if (approvalStatId == ApprovalStats.xPulledBack) {
            strText = 'xConfirmPullBackConnection';
        }

        this.dialogService.show({
            text: this.dicService.getValue(strText),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.busy = true;
                const saveDto = new ApprovalRelationSaveDto();
                saveDto.ApprovalRelationId = listItem.ApprovalRelationId;
                saveDto.ApprovalStatId = approvalStatId;
                let subs = this.approvalRelationService.save(saveDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            if (approvalStatId == ApprovalStats.xAccepted) {
                                strText = 'xConnectionAccepted';
                            } else if (approvalStatId == ApprovalStats.xRejected) {
                                strText = 'xConnectionRejected';
                            } else if (approvalStatId == ApprovalStats.xPulledBack) {
                                strText = 'xConfirmPulledBack';
                            }

                            this.toastr.success(this.dicService.getValue(strText));
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
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}

// Notes
// I did not add paging here intentionally because I thought there would not be so much relations.
// If sometimes count of relations increase about 50, then add here paging.