import { Component, OnInit, ViewChild, OnDestroy, Input, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { PageTitleComp } from '../../../../general/page-title/page-title.comp';
import { PersonAccountActivityListCriteriaComp } from './criteria/criteria.comp';

// Service
import { PersonAccountService } from '../../../../../service/person/account.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonAccountActivityListDto } from '../../../../../dto/person/account/activity-list.dto';
import { PersonAccountActivityGetListCriteriaDto } from '../../../../../dto/person/account/activity-getlist-criteria.dto';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { FicheTypes } from '../../../../../enum/fiche/types.enum';
import { Stc, expandCollapse } from '../../../../../stc';

@Component({
    selector: 'person-account-activity-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonAccountActivityListIndexComp implements OnInit, OnDestroy {
    @Input('IsOpen') IsOpen: boolean;
    @Input('IsInside') IsInside: boolean = false;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;
    @ViewChild(PersonAccountActivityListCriteriaComp, { static: false }) childCriteria: PersonAccountActivityListCriteriaComp;

    criteriaDto: PersonAccountActivityGetListCriteriaDto;
    activityListDto: PersonAccountActivityListDto[];

    isFicheOpen: boolean = false;

    subscriptionCriteria: Subscription;

    ficheTypes = FicheTypes;

    busy: boolean = false;

    constructor(
        private personAccountService: PersonAccountService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.activityListDto = [];

        // This code must stand here becuase it confuses with the criteria comp.
        this.subscriptionCriteria = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x) && x.includes('PersonAccountActivityListCriteria')) {
                    this.criteriaDto = JSON.parse(x).PersonAccountActivityListCriteria;
                    this.activityListDto = [];
                    this.loadData();
                }
            }
        );
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionCriteria);
    }

    showInside(criteriaDto: PersonAccountActivityGetListCriteriaDto, accountName: string): void {
        this.childCriteria.showInside(criteriaDto, accountName);

        this.criteriaDto = criteriaDto;

        setTimeout(() => {
            this.childCriteria.search();
        });
    }

    loadData(): void {
        if (this.utils.isNull(this.criteriaDto) || this.waitTill) return;

        this.waitTill = true;

        this.busy = true;
        this.criteriaDto.PageOffSet = this.activityListDto.length;
        let subs = this.personAccountService.getActivityList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                this.waitTill = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let found: PersonAccountActivityListDto = null;
                        x.Dto.forEach(element => {
                            found = this.activityListDto.find(f => f.Id == element.Id);
                            if (this.utils.isNull(found)) {
                                this.activityListDto.push(element);
                            }
                        });
                    }
                }
            },
            err => {
                this.waitTill = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    waitTill: boolean = false;
    waitRepeat: boolean = false;
    @HostListener('window:scroll', ['$event'])
    onScroll($event: Event): void {
        if (this.IsInside) return;

        if ((window.innerHeight + window.scrollY + 1) >= document.scrollingElement.scrollHeight) {
            this.more();
        }
    }

    more(): void {
        if (!this.waitRepeat) {
            this.waitRepeat = true;

            setTimeout(() => {
                this.waitRepeat = false;
            }, Stc.waitRepeatTimeout);

            this.loadData();
        }
    }
}