import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

// Comp
import { NotificationSmallListItemComp } from './item/item.comp';

// Service
import { NotificationService } from '../../../../service/notification/notification.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { NotificationListDto } from '../../../../dto/notification/list.dto';
import { NotificationSeenDto } from '../../../../dto/notification/seen.dto';
import { NotificationGetListCriteriaDto } from '../../../../dto/notification/getlist-criteria.dto';
import { PersonNotificationSummaryDto } from '../../../../dto/person/notification-summary.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { Stc, expandCollapse } from '../../../../stc';

@Component({
    selector: 'notification-small-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class NotificationSmallListIndexComp implements OnInit, OnDestroy {
    criteriaDto: NotificationGetListCriteriaDto;

    notificationSummaryDto: PersonNotificationSummaryDto;

    profile: PersonProfileBo;

    @ViewChildren(NotificationSmallListItemComp) childrenItems: QueryList<NotificationSmallListItemComp>;
    @ViewChild('scrollDiv', { static: false }) private scrollDiv: ElementRef;

    needRefreshSubscription: Subscription;

    waitTill: boolean = false;

    busy: boolean = false;
    notificationList: NotificationListDto[];

    constructor(
        private notificationService: NotificationService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        public el: ElementRef) {
        this.profile = this.localStorageService.personProfile;

        this.notificationList = [];

        this.notificationSummaryDto = Stc.notificationSummaryDto;

        this.criteriaDto = new NotificationGetListCriteriaDto();

        this.loadData();
    }

    ngOnInit(): void {
        this.needRefreshSubscription = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'ProfileChanged' || x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                    this.loadData();
                } else if (x == 'PersonNotificationSummary') {
                    this.notificationSummaryDto = Stc.notificationSummaryDto;
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.needRefreshSubscription);
    }

    show: boolean = false;
    loadData(): void {
        if (this.waitTill) return;

        this.waitTill = true;

        this.compBroadCastService.sendMessage(CompBroadCastTypes.GoogleAnalytics);
        this.busy = true;
        this.criteriaDto.MyPersonId = this.profile.PersonId;
        this.criteriaDto.PageOffSet = this.notificationList.length;
        let subs = this.notificationService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                this.waitTill = false;

                if (x.IsSuccess) {
                    this.show = true;
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let found: NotificationListDto = null;
                        x.Dto.forEach(element => {
                            found = this.notificationList.find(f => f.NotificationId == element.NotificationId);
                            if (this.utils.isNull(found)) {
                                if (this.utils.isNotNull(element.OrderStatId)) {
                                    element.OrderStat = Stc.orderStatListDto.find(z => z.Id == element.OrderStatId);
                                }
                                this.notificationList.push(element);
                            }
                        });
                    }
                    
                    if (this.utils.isNotNull(this.notificationList) && this.notificationList.length > 0
                        && !this.notificationList[0].IsSeen
                        && !this.notificationList[0].SentSeen
                        && !this.notificationList[0].WaitingSeen
                        && this.criteriaDto.PageOffSet == 0) {

                        setTimeout(() => {
                            this.seen(this.notificationList[0]);
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

    seen(listItem: NotificationListDto): void {
        listItem.WaitingSeen = true;
        const seenDto = new NotificationSeenDto();
        seenDto.MyPersonId = this.profile.PersonId;
        seenDto.NotificationIdList = [];
        seenDto.NotificationIdList.push(listItem.NotificationId);
        let subs = this.notificationService.seen(seenDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    listItem.SentSeen = true;
                    listItem.IsSeen = true;
                } else {
                    this.dialogService.showError(x.Message);
                }

                listItem.WaitingSeen = false;
            },
            err => {
                listItem.WaitingSeen = false;
                this.logExService.saveObservableEx(err, this.constructor.name, 'seen', subs);
            }
        );
    }

    onScroll(event: any): void {
        if (this.utils.isNull(this.childrenItems) || this.childrenItems.length == 0) return;

        const scrollPosition = event.srcElement.scrollTop;
        let deger: number = 0;
        deger = this.utils.round(event.srcElement.offsetHeight + scrollPosition, 0);
        if ((this.scrollDiv.nativeElement.scrollHeight - deger) / this.scrollDiv.nativeElement.scrollHeight === 0) {
            this.loadData();
        }

        let count: number = 0;
        this.childrenItems.forEach(element => {
            count++;
            let componentPosition = element.el.nativeElement.offsetTop;

            //element.listItem.IsSeen = scrollPosition >= (componentPosition - 100);

            // TODO:
            // Optimize here:
            if (scrollPosition >= (componentPosition - 220)
                && !element.listItem.IsSeen
                && !element.listItem.SentSeen
                && !element.listItem.WaitingSeen) {
                this.seen(element.listItem);
            }

            if (count == this.childrenItems.length) {
                //console.log(this.notificationList.filter(f => f.IsSeen));
            }
        });
    }
}