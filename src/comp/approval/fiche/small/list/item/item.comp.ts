import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { ApprovalFicheSmallListIndexComp } from '../index.comp';

// Service
import { FicheService } from '../../../../../../service/fiche/fiche.service';
import { LocalStorageService } from '../../../../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../../../service/dictionary/dictionary.service';

// Dto
import { ApprovalFicheListDto } from '../../../../../../dto/approval/fiche/list.dto';

// Enum
import { ApprovalStats } from '../../../../../../enum/approval/stats.enum';
import { FicheContents } from '../../../../../../enum/fiche/contents.enum';
import { FicheTypeFakes } from '../../../../../../enum/fiche/type-fakes.enum';
import { PersonTypes } from '../../../../../../enum/person/person-types.enum';
import { CompBroadCastTypes } from '../../../../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'approval-fiche-small-list-item',
    templateUrl: './item.comp.html'
})
export class ApprovalFicheSmallListItemComp implements OnInit, OnDestroy {
    host: ApprovalFicheSmallListIndexComp;

    @Input('listItem') listItem: ApprovalFicheListDto;

    ficheTypeFakes = FicheTypeFakes;
    ficheContents = FicheContents;
    approvalStats = ApprovalStats;
    personTypes = PersonTypes;

    amIDebt: boolean = false;

    xCaption: string = '';
    relatedPersonFullName: string = '';
    relatePersonTypeId: PersonTypes;

    constructor(
        @Host() host: ApprovalFicheSmallListIndexComp,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private localStorageService: LocalStorageService,
        private ficheService: FicheService) {
        this.host = host;
    }

    ngOnInit(): void {        
        const profile = this.localStorageService.personProfile;
        this.amIDebt = this.listItem.DebtPersonId == profile.PersonId;

        this.relatedPersonFullName = this.amIDebt ? this.listItem.CreditPersonFullName : this.listItem.DebtPersonFullName;
        this.relatePersonTypeId = this.amIDebt ? this.listItem.CreditPersonTypeId : this.listItem.DebtPersonTypeId;

        this.xCaption = this.ficheService.getOtherPersonCaption(this.listItem.FicheTypeId, this.amIDebt);
    }
    ngOnDestroy(): void {
    }

    openFiche(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({ 'FicheListItemModalComp': { 'ficheId': this.listItem.FicheId } }));
    }
    saveFiche(approvalStatId:ApprovalStats): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.SaveAttempt, JSON.stringify({ 'ApprovalFicheSaveAttempt': { 'ficheId': this.listItem.FicheId, 'approvalStatId': approvalStatId, 'ficheApprovalStatId': this.listItem.FicheApprovalStatId } }));
    }
}