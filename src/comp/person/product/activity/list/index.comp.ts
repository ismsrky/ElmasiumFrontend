import { Component, OnInit, ViewChild, OnDestroy, Input, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { PersonProductActivityListCriteriaComp } from './criteria/criteria.comp';
import { PageTitleComp } from '../../../../general/page-title/page-title.comp';

// Service
import { PersonProductService } from '../../../../../service/person/product.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonProductActivityListDto } from '../../../../../dto/person/product/activity-list.dto';
import { PersonProductActivityGetListCriteriaDto } from '../../../../../dto/person/product/activity-getlist-criteria.dto';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { Stc, expandCollapse } from '../../../../../stc';

@Component({
    selector: 'person-product-activity-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonProductActivityListIndexComp implements OnInit, OnDestroy {
    @Input('IsOpen') IsOpen: boolean;
    @Input('IsInside') IsInside: boolean = false;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;
    @ViewChild(PersonProductActivityListCriteriaComp, { static: false }) childCriteria: PersonProductActivityListCriteriaComp;

    criteriaDto: PersonProductActivityGetListCriteriaDto;
    activityListDto: PersonProductActivityListDto[];

    isFicheOpen: boolean = false;

    subscriptionCriteria: Subscription;

    busy: boolean = false;

    constructor(
        private personProductService: PersonProductService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService, ) {
        this.activityListDto = [];

        // This code must stand here becuase it confuses with the criteria comp.
        this.subscriptionCriteria = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x) && x.includes('PersonProductActivityListCriteria')) {
                    this.criteriaDto = JSON.parse(x).PersonProductActivityListCriteria;
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

    showInside(criteriaDto: PersonProductActivityGetListCriteriaDto, productName: string): void {
        this.childCriteria.showInside(criteriaDto, productName);

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
        let subs = this.personProductService.getActivityList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                this.waitTill = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let found: PersonProductActivityListDto = null;
                        x.Dto.forEach(element => {
                            found = this.activityListDto.find(f => f.Id == element.Id);
                            if (this.utils.isNull(found)) {
                                this.activityListDto.push(element);
                            }
                        });
                    }
                } else {
                    this.dialogService.showError(x.Message);
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