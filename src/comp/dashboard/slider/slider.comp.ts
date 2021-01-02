import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription, timer } from 'rxjs';

// Comp

// Service
import { DashboardSliderService } from '../../../service/dashboard/slider.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { DashboardSliderGetListCriteriaDto } from '../../../dto/dashboard/slider/getlist-criteria.dto';
import { DashboardSliderGroupListDto } from '../../../dto/dashboard/slider/group-list.dto';
import { DashboardSliderListDto } from '../../../dto/dashboard/slider/list.dto';

// Bo

// Enum
import { Stc, expandCollapse } from '../../../stc';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'dashboard-slider',
    templateUrl: './slider.comp.html',
    styleUrls: ['./slider.comp.css'],
    animations: [expandCollapse]
})
export class DashboardSliderComp implements OnInit, OnDestroy {
    groupListDto: DashboardSliderGroupListDto[] = null;
    selectedGroup: DashboardSliderGroupListDto = null;

    selectedListDto: DashboardSliderListDto[] = null;
    selected: DashboardSliderListDto = null;

    environment = environment;

    busy: boolean = false;

    aniSlide: boolean = false;

    slideIntervalMs: number = 5000; // in miliseconds

    timerReconnect = timer(this.slideIntervalMs, this.slideIntervalMs);
    subscriptionReconnect: Subscription;

    isNarrow: boolean = true;
    constructor(
        private dashboardSliderService: DashboardSliderService,
        private localStorageService: LocalStorageService,
        private dicService: DictionaryService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private dialogService: DialogService,
        private compBroadCastService: CompBroadCastService) {
        this.isNarrow = window.innerWidth <= 768; // md
    }

    ngOnInit(): void {
        this.startTimer();

        this.getGroupList();
    }
    ngOnDestroy(): void {
        this.stopTimer();
    }

    startTimer(): void {
        this.subscriptionReconnect = this.timerReconnect.subscribe(
            x => {
                this.move(true, false);
            }
        );
    }
    stopTimer(): void {
        this.utils.unsubs(this.subscriptionReconnect);
    }
    restartTimer(): void {
        this.stopTimer();

        setTimeout(() => {
            this.startTimer();
        }, 200);
    }

    groupClick(selectedGroup: DashboardSliderGroupListDto): void {
        this.selectedGroup = selectedGroup;

        this.getList();
    }

    selectGroup(): void {
    }
    /**
     * 
     next(): void {
        setTimeout(() => {
            let i = this.selectedListDto.findIndex(x => x.Id == this.selected.Id);

            let dIndex: number = 0;
            if (i == this.selectedListDto.length - 1) {
                dIndex = 0;
            } else {
                dIndex = i + 1;
            }

            this.select(this.selectedListDto[dIndex]);
        }, this.slideIntervalMs);
    }
     */

    move(isNext: boolean, isRestartTimer: boolean): void {
        let i = this.selectedListDto.findIndex(x => x.Id == this.selected.Id);

        let dIndex: number = 0;
        if (!isNext && i == 0) {
            dIndex = this.selectedListDto.length - 1;
        }
        else if ((isNext && i == this.selectedListDto.length - 1)) {
            dIndex = 0;
        } else {
            dIndex = i + (isNext ? 1 : -1);
        }

        this.select(this.selectedListDto[dIndex], isRestartTimer);
    }

    select(selected: DashboardSliderListDto, isRestartTimer: boolean): void {
        //this.selected = null;

        this.selected = selected;
        this.aniSlide = true;
        setTimeout(() => {
            this.aniSlide = false;
        }, 100);

        if (isRestartTimer) {
            this.restartTimer();
        }
        //this.move(true);
    }

    getGroupList(): void {
        this.busy = true;
        let subs = this.dashboardSliderService.getGroupList().subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.groupListDto = x.Dto;

                    if (this.utils.isNotNull(this.groupListDto) && this.groupListDto.length > 0) {
                        this.groupClick(this.groupListDto[0])
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getGroupList', subs);
                this.busy = false;
            }
        );
    }

    getList(): void {
        if (this.utils.isNull(this.selectedGroup)) return;

        const criteriaDto = new DashboardSliderGetListCriteriaDto();
        criteriaDto.GroupId = this.selectedGroup.Id;
        this.busy = true;
        let subs = this.dashboardSliderService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.selectedListDto = x.Dto;

                    if (this.utils.isNotNull(this.selectedListDto) && this.selectedListDto.length > 0) {
                        this.select(this.selectedListDto[0], true);
                    } else {
                        this.select(null, true);
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getList', subs);
                this.busy = false;
            }
        );
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}