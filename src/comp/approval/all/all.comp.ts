import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { ApprovalRelationSmallListIndexComp } from '../relation/small/list/index.comp';
import { ApprovalFicheSmallListIndexComp } from '../fiche/small/list/index.comp';

// Service
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PersonNotificationSummaryDto } from '../../../dto/person/notification-summary.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { PersonTypes } from '../../../enum/person/person-types.enum';
import { Stc } from '../../../stc';

@Component({
    selector: 'approval-all',
    templateUrl: './all.comp.html'
})
export class ApprovalAllComp implements OnInit, OnDestroy {
    notificationSummaryDto: PersonNotificationSummaryDto;

    @ViewChild(ApprovalFicheSmallListIndexComp, { static: false }) childFicheListComp: ApprovalFicheSmallListIndexComp;
    @ViewChild(ApprovalRelationSmallListIndexComp, { static: false }) childRelationListComp: ApprovalRelationSmallListIndexComp;

    showApprovalFiche = false;
    showApprovalRelation = false;
    showApprovalOrder = false;
    showApprovalReturn = false;
    incomigs: boolean = true;

    profile: PersonProfileBo;

    personTypes = PersonTypes;

    subsNeedRefresh: Subscription;

    constructor(private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;

        this.notificationSummaryDto = Stc.notificationSummaryDto;

        this.approvalFicheClick();
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    toggleIncomigns(): void {
        this.incomigs = !this.incomigs;

        this.loadData();
    }
    approvalFicheClick(): void {
        this.showApprovalFiche = !this.showApprovalFiche;

        if (this.showApprovalFiche) {
            this.showApprovalRelation = false;
            this.showApprovalOrder = false;
            this.showApprovalReturn = false;
        }

        this.loadData();
    }
    approvalRelationClick(): void {
        this.showApprovalRelation = !this.showApprovalRelation;

        if (this.showApprovalRelation) {
            this.showApprovalFiche = false;
            this.showApprovalOrder = false;
            this.showApprovalReturn = false;
        }

        this.loadData();
    }
    approvalOrderClick(): void {
        this.showApprovalOrder = !this.showApprovalOrder;

        if (this.showApprovalOrder) {
            this.showApprovalRelation = false;
            this.showApprovalFiche = false;
            this.showApprovalReturn = false;
        }

        this.loadData();
    }
    approvalReturnClick(): void {
        this.showApprovalReturn = !this.showApprovalReturn;

        if (this.showApprovalReturn) {
            this.showApprovalRelation = false;
            this.showApprovalFiche = false;
            this.showApprovalOrder = false;
        }

        this.loadData();
    }

    loadData(): void {
        setTimeout(() => {
            if (this.showApprovalFiche) {
                this.childFicheListComp.loadData(this.incomigs);
            } else if (this.showApprovalRelation) {
                this.childRelationListComp.loadData(this.incomigs);
            }
        });
    }
}