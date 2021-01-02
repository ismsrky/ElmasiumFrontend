import { Component, OnInit, OnDestroy, Host, Input } from '@angular/core';

// Services
import { DictionaryService } from '../../../../../../service/dictionary/dictionary.service';

// Component
import { PersonRelationFindListIndexComp } from '../index.comp';

// Dto
import { PersonRelationFindListDto } from '../../../../../../dto/person/relation/find/list.dto';

// Enum
import { DialogIcons } from '../../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../../enum/sys/dialog/dialog-buttons.enum';
import { Currencies } from '../../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../../enum/sys/stats.enum';
import { PersonTypes } from '../../../../../../enum/person/person-types.enum';
import { RelationTypes } from '../../../../../../enum/person/relation-types.enum';
import { ApprovalStats } from '../../../../../../enum/approval/stats.enum';

@Component({
    selector: 'person-relation-find-list-item',
    templateUrl: './item.comp.html'
})
export class PersonRelationFindListItemComp implements OnInit, OnDestroy {
    host: PersonRelationFindListIndexComp;

    @Input('listItem') listItem: PersonRelationFindListDto;

    approvalStats = ApprovalStats;
    currencies = Currencies;
    stats = Stats;
    personTypes = PersonTypes;

    addAsText: string = '';
    disconnectText: string = '';

    busy: boolean = false;

    constructor(@Host() host: PersonRelationFindListIndexComp,
        private dicService: DictionaryService) {
        this.host = host;
    }

    ngOnInit(): void {
        switch (this.host.criteriaDto.RelationTypeId) {
            case RelationTypes.xFriend:
                this.addAsText = 'xAddAsFriend';

                if (this.listItem.ApprovalStatId == ApprovalStats.xPending)
                    this.disconnectText = 'xPending';
                else
                    this.disconnectText = 'xYourFriend';

                break;
            case RelationTypes.xCustomer:
                this.addAsText = 'xAddAsCustomer';

                if (this.listItem.ApprovalStatId == ApprovalStats.xPending)
                    this.disconnectText = 'xPending';
                else
                    this.disconnectText = 'xYourCustomer';
                break;
            case RelationTypes.xSeller:
                this.addAsText = 'xAddAsSeller';

                if (this.listItem.ApprovalStatId == ApprovalStats.xPending)
                    this.disconnectText = 'xPending';
                else
                    this.disconnectText = 'xYourSeller';
                break;
            case RelationTypes.xStaff:
                this.addAsText = 'xAddAsStaff';

                if (this.listItem.ApprovalStatId == ApprovalStats.xPending)
                    this.disconnectText = 'xPending';
                else
                    this.disconnectText = 'xYourStaff';
                break;
            case RelationTypes.xShopOwner:
                this.addAsText = 'xAddAsShopOwner';

                if (this.listItem.ApprovalStatId == ApprovalStats.xPending)
                    this.disconnectText = 'xPending';
                else
                    this.disconnectText = 'xShopOwner';
                break;
            default:
                break;
        }
    }
    ngOnDestroy(): void {
    }
}