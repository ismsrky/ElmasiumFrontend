import { Component, OnInit, ViewChild, OnDestroy, Input, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { FicheListCriteriaComp } from './criteria/criteria.comp';
import { PageTitleComp } from '../../general/page-title/page-title.comp';

// Service
import { FicheService } from '../../../service/fiche/fiche.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { FicheListDto } from '../../../dto/fiche/list.dto';
import { FicheGetListCriteriaDto } from '../../../dto/fiche/getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { FicheTypes } from '../../../enum/fiche/types.enum';
import { ApprovalStats } from '../../../enum/approval/stats.enum';
import { FicheTypeFakes } from '../../../enum/fiche/type-fakes.enum';
import { Stc, expandCollapse } from '../../../stc';

@Component({
    selector: 'fiche-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class FicheListIndexComp implements OnInit, OnDestroy {
    profile: PersonProfileBo;

    @Input('IsOpen') IsOpen: boolean = false;
    @Input('IsInside') IsInside: boolean = false;
    @Input('forRelated') forRelated: boolean = false;
    @Input('top10') top10: boolean = false;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;
    @ViewChild(FicheListCriteriaComp, { static: false }) childCriteria: FicheListCriteriaComp;

    criteriaDto: FicheGetListCriteriaDto;
    ficheListDto: FicheListDto[];

    subscriptionCriteria: Subscription;

    ficheTypes = FicheTypes;

    openTop10: boolean = false;

    busy: boolean = false;
    constructor(
        private ficheService: FicheService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.ficheListDto = [];

        this.profile = this.localStorageService.personProfile;

        // This code must stand here becuase it confuses with the criteria comp.
        this.subscriptionCriteria = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;

                    if (this.top10 && this.openTop10) {
                        setTimeout(() => {
                            this.criteriaDto.PageOffSet = 0;
                            this.loadData(true);
                        }, 1000);
                    }
                } else if (x == 'getSummary') {
                    if (this.top10 && this.openTop10) {
                        setTimeout(() => {
                            this.criteriaDto.PageOffSet = 0;
                            this.loadData(true);
                        }, 1000);
                    }
                } else if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('FicheListCriteria')) {
                        this.criteriaDto = JSON.parse(x).FicheListCriteria;
                        this.loadData(true);
                    }
                }
            }
        );
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionCriteria);
    }

    loadData(clearPrev: boolean): void {
        if (this.utils.isNull(this.criteriaDto) || this.waitTill || this.localStorageService.personProfile.PersonId == -2) {
            return;
        }

        this.waitTill = true;

        this.busy = true;
        if (clearPrev)
            this.ficheListDto = [];
        else
            this.criteriaDto.PageOffSet = this.ficheListDto.length;

        this.compBroadCastService.sendMessage(CompBroadCastTypes.GoogleAnalytics);
        let subs = this.ficheService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                this.waitTill = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let found: FicheListDto = null;
                        x.Dto.forEach(element => {
                            found = this.ficheListDto.find(f => f.Id == element.Id);
                            if (this.utils.isNull(found)) {
                                this.ficheListDto.push(element);
                            }
                        });
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;

                this.waitTill = false;
            }
        );
    }

    removeItem(id: number): void {
        const ind: number = this.ficheListDto.findIndex(x => x.Id == id);
        this.ficheListDto.splice(ind, 1);
    }

    // Leave null param 'otherPersonFullName' if OtherPersonsIdList.length != 0.
    showInside(criteriaDto: FicheGetListCriteriaDto, otherPersonFullName: string): void {
        criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        if (!this.forRelated)
            this.childCriteria.showInside(criteriaDto, otherPersonFullName);

        this.criteriaDto = criteriaDto;

        if (this.forRelated) {
            this.loadData(false);
        } else {
            setTimeout(() => {
                this.childCriteria.search();
            });
        }
    }
    showTop10(): void {
        this.top10 = true;
        const criteriaDto = new FicheGetListCriteriaDto();

        criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;

        criteriaDto.OtherPersonsIdList = [];

        criteriaDto.ApprovalStatIdList = [];
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xAccepted);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPending);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPulledBack);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xRejected);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xDeleted);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPendingDeleted);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xUncompleted);

        criteriaDto.FicheTypeFakeIdList = [];

        for (let enumMember in FicheTypeFakes) {
            if (!isNaN(parseInt(enumMember, 10))) {
                criteriaDto.FicheTypeFakeIdList.push(parseInt(enumMember, 10));
            }
        }

        criteriaDto.IssueDateStartNumber = null;
        criteriaDto.IssueDateStart = null;

        criteriaDto.IssueDateEndNumber = null;
        criteriaDto.IssueDateEnd = null;

        //this.childCriteria.showInside(criteriaDto, null, true);
        this.criteriaDto = criteriaDto;
        //this.loadData(true);
        /**
         * setTimeout(() => {
            this.childCriteria.search();
        });
         */
    }
    clickTop10(): void {
        this.openTop10 = !this.openTop10;

        if (this.openTop10) {
            this.loadData(true);
        }
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

            this.loadData(false);
        }
    }
}