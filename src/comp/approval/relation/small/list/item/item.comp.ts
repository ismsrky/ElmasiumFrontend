import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';

// Service
import { PersonRelationService } from '../../../../../../service/person/relation.service';
import { LocalStorageService } from '../../../../../../service/sys/local-storage.service';

// Comp
import { ApprovalRelationSmallListIndexComp } from '../index.comp';

// Dto
import { ApprovalRelationListDto } from '../../../../../../dto/approval/relation/list.dto';

// Enum
import { ApprovalStats } from '../../../../../../enum/approval/stats.enum';
import { PersonTypes } from '../../../../../../enum/person/person-types.enum';
import { RelationTypes } from '../../../../../../enum/person/relation-types.enum';
import { Stc } from '../../../../../../stc';

@Component({
    selector: 'approval-relation-small-list-item',
    templateUrl: './item.comp.html'
})
export class ApprovalRelationSmallListItemComp implements OnInit, OnDestroy {
    host: ApprovalRelationSmallListIndexComp;

    @Input('listItem') listItem: ApprovalRelationListDto;

    busy: boolean = false;
    isMobile: boolean = Stc.isMobile;

    personTypes = PersonTypes;
    relationTypes = RelationTypes;
    approvalStats = ApprovalStats;

    addAsText: string = '';

    amIParent: boolean = false;

    constructor(
        @Host() host: ApprovalRelationSmallListIndexComp,
        private personRelationService: PersonRelationService,
        private localStorageService: LocalStorageService) {
        this.host = host;
    }

    ngOnInit(): void {
        const profile = this.localStorageService.personProfile;
        this.amIParent = this.listItem.ParentPersonId == profile.PersonId;
        this.addAsText = this.personRelationService.getAddAsText(this.listItem.RelationTypeId, this.amIParent);
    }
    ngOnDestroy(): void {
    }

    save(approvalStatId: ApprovalStats): void {
        this.host.save(this.listItem, approvalStatId);
    }
}