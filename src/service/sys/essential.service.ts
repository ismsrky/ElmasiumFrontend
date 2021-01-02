import { Injectable } from '@angular/core';

import { Stc } from '../../stc';
import { UtilService } from './util.service';
import { EnumsOpService } from '../enumsop/enumsop.service';
import { CompBroadCastService } from './comp-broadcast-service';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { OrderService } from '../order/order.service';
import { DialogService } from './dialog.service';
import { PersonService } from '../person/person.service';
import { LogExceptionService } from '../log/exception.service';

@Injectable()
export class EssentialService {
    /**
     * Notes:
     * This service was written to get all essetial data in order to start website.
     * Please do not let other comps to use this service except 'AppComponent'.
     */

    doneGetFicheContentList: boolean = false;
    doneGetCurrencyList: boolean = false;
    doneGetLanguages: boolean = false;
    doneGetFicheFakeTypes: boolean = false;

    doneGetOrderStatList: boolean = false;
    doneGetOrderStatNextList: boolean = false;

    doneGetNotificationSummary: boolean = false;
    constructor(
        private orderService: OrderService,
        private enumsOpService: EnumsOpService,
        private personService: PersonService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
    }

    // Call this method only once at the default constructor of 'AppComponent'.
    // Then wait to receive 'OnAir' message. It is sent only when all essential data is taken.
    load(): void {
        // Do not add to much things here. Everything added here is increasing first open duration of the web site.
        // Think twice when adding something new.
        // Try to find a better way.
        this.getEnums();

        this.getOrderStatList();

        this.getStatNextList();

        this.getNotificationSummary();
    }

    private getEnums(): void {
        let subscribeFicheContent = this.enumsOpService.getFicheContentList().subscribe(
            x => {
                this.utils.unsubs(subscribeFicheContent);

                Stc.ficheContentGroupBoList = x;

                this.doneGetFicheContentList = true;
                this.checkFireEvent();
            }
        );

        let subscribeGetCurrencyList = this.enumsOpService.getCurrencyList().subscribe(
            x => {
                this.utils.unsubs(subscribeGetCurrencyList);

                Stc.currenciesDto = x;

                this.doneGetCurrencyList = true;
                this.checkFireEvent();
            }
        );

        let subscribeLanguage = this.enumsOpService.getLanguages().subscribe(
            x => {
                this.utils.unsubs(subscribeLanguage);

                Stc.languagesDto = x;

                this.doneGetLanguages = true;
                this.checkFireEvent();
            }
        );

        let subscribeGetFicheFakeTypes = this.enumsOpService.getFicheFakeTypes().subscribe(
            x => {
                this.utils.unsubs(subscribeGetFicheFakeTypes);

                Stc.ficheTypeFakeDto = x;

                this.doneGetFicheFakeTypes = true;
                this.checkFireEvent();
            }
        );
    }

    private getOrderStatList(): void {
        /**
         * if (!Stc.isRealLogin) {
            this.doneGetOrderStatList = true;
            return;
        }
         */

        let subs = this.orderService.getStatList().subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    Stc.orderStatListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }

                this.doneGetOrderStatList = true;
                this.checkFireEvent();
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getOrderStatList', subs);
            }
        );
    }

    private getStatNextList(): void {
        /**
         * if (!Stc.isRealLogin) {
            this.doneGetOrderStatNextList = true;
            return;
        }
         */

        let subs = this.orderService.getStatNextList().subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    Stc.orderStatNextListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }

                this.doneGetOrderStatNextList = true;
                this.checkFireEvent();
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getStatNextList', subs);
            }
        );
    }

    private getNotificationSummary(): void {
        let subs = this.personService.getNotificationSummary().subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    Stc.notificationSummaryDto = x.Dto;

                    this.personService.calculateNotifyTotals();
                } else {
                    this.dialogService.showError(x.Message);
                }

                this.doneGetNotificationSummary = true;
                this.checkFireEvent();
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getNotificationSummary', subs);
            }
        );
    }

    private checkFireEvent(): void {
        if (this.doneGetFicheContentList
            && this.doneGetCurrencyList
            && this.doneGetLanguages
            && this.doneGetFicheFakeTypes
            && this.doneGetOrderStatList
            && this.doneGetOrderStatNextList
            && this.doneGetNotificationSummary) {
            this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'OnAir');
        }
    }
}