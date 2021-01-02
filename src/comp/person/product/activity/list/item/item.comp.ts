import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// Service
import { FicheService } from '../../../../../../service/fiche/fiche.service';

// Dto
import { FicheListDto } from '../../../../../../dto/fiche/list.dto';
import { FicheGetListCriteriaDto } from '../../../../../../dto/fiche/getlist-criteria.dto';
import { PersonProductActivityListDto } from '../../../../../../dto/person/product/activity-list.dto';

// Enum
import { ApprovalStats } from '../../../../../../enum/approval/stats.enum';
import { ProductTypes } from '../../../../../../enum/product/types.enum';
import { Stc, expandCollapse } from '../../../../../../stc';
import { UtilService } from '../../../../../../service/sys/util.service';

@Component({
    selector: 'person-product-activity-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class PersonProductActivityListItemComp implements OnInit, OnDestroy {
    constructor(
        private ficheService: FicheService,
        private utils: UtilService) {
        this.ficheListDto = new FicheListDto(this.utils);
    }

    @Input('listItem') listItem: PersonProductActivityListDto;

    ficheListDto: FicheListDto;

    busy: boolean = false;

    xCaption: string = '';

    showFiche: boolean = false;
    gotFiche: boolean = false; // in order to prevent to get same data from server.   

    productTypes = ProductTypes;
    approvalStats = ApprovalStats;

    ngOnInit(): void {
        this.xCaption = this.listItem.IsDebt ? 'xIncoming' : 'xOutgoing';
    }
    ngOnDestroy(): void {
    }

    showFicheClick(): void {
        this.showFiche = !this.showFiche;

        if (!this.showFiche || this.gotFiche) return;

        const criteriaDto = new FicheGetListCriteriaDto();
        criteriaDto.FicheId = this.listItem.FicheId;

        this.busy = true;
        let subscribeGetList = this.ficheService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subscribeGetList);
                this.busy = false;

                if (x.IsSuccess && x.Dto.length > 0) {
                    x.Dto[0].IssueDate = new Date(x.Dto[0].IssueDateNumber);

                    this.ficheListDto = x.Dto[0];
                    this.gotFiche = true;
                }
            },
            err => {
                this.busy = false;
                this.utils.unsubs(subscribeGetList);
            }
        );

    }
}