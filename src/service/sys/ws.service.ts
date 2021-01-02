import { Injectable, OnInit, OnDestroy } from '@angular/core';

import { LocalStorageService } from '../sys/local-storage.service';
import { Stc } from '../../stc';
import { Subscription, Observable, timer } from 'rxjs';
import { CompBroadCastService } from './comp-broadcast-service';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { WsNotifyTypes } from '../../enum/sys/ws-notify-types.enum';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { AppRouterService } from './router.service';
import { AppRoutes } from '../../enum/sys/routes.enum';
import { PersonService } from '../person/person.service';
import { DialogService } from './dialog.service';
import { PersonNotifyListDto } from '../../dto/person/notify-list.dto';
import { WsNotificationGroupTypes } from '../../enum/sys/ws-notify-group-types.enum';
import { UtilService } from './util.service';

@Injectable()
export class WsService implements OnInit, OnDestroy {
    ws: WebSocket;

    get wsUrl(): string {
        if (environment.production)
            return `wss://${environment.serverIP}:${environment.wsPort}/${environment.wsPath}`;
        else
            return `ws://${environment.serverIP}:${environment.wsPort}/${environment.wsPath}`
    }

    constructor(
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private personService: PersonService,
        private appRouterService: AppRouterService,
        private dialogService: DialogService,
        private utils: UtilService) {
        // console.log('environment' + environment.production);
        this.reConnect();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionReconnect);
    }

    timerReconnect = timer(100, 30000);
    subscriptionReconnect: Subscription;

    isConnected: boolean = false;

    connect(): void {
        this.disconnect();

        setTimeout(() => {
            this.isConnected = true;
            this.ws = new WebSocket(this.wsUrl);
    
            this.ws.onopen = (evt) => {
                this.shakeHand();
            };
    
            this.ws.onmessage = (evt) => {
                // console.log(evt.data);
    
                // response 'fail' can be in varius situation. Client session can be timeout or server restart maybe.
                if (evt.data == 'fail') {
                    location.reload(true);
                }
    
                if (evt.data != 'fail' && evt.data != 'ok') {
                    let list: PersonNotifyListDto[];
    
                    list = JSON.parse(evt.data);
    
                    if (this.utils.isNotNull(list) && list.length > 0) {
                        if (this.utils.isNotNull(list.find(x => x.PersonId == this.localStorageService.personProfile.PersonId && x.WsNotificationGroupTypeId == WsNotificationGroupTypes.GetSummary))) {
                            this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'getSummary');
                        }
                        if (this.utils.isNotNull(list.find(x => x.PersonId == this.localStorageService.personProfile.PersonId && x.WsNotificationGroupTypeId == WsNotificationGroupTypes.PersonNotificationSummary))) {
                            this.getNotificationSummary();
                        }
                        if (this.utils.isNotNull(list.find(x => x.PersonId == this.localStorageService.personProfile.PersonId && x.WsNotificationGroupTypeId == WsNotificationGroupTypes.PendingOrder))) {
                            this.getNotificationSummary();
                            setTimeout(() => {
                                this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'PendingOrder');
                            }, 1000);
                        }
                        if (this.utils.isNotNull(list.find(x => x.PersonId != this.localStorageService.personProfile.PersonId && x.WsNotificationGroupTypeId == WsNotificationGroupTypes.PersonNotificationSummary))) {
                            //console.log('başka var hacı');
                        }
                    }
                }
    
                //this.getNotificationSummary();
            };
    
            this.ws.onclose = (evt) => {
                if (this.isConnected) {
                    this.connect();
                }
            };
        }, 1000);
    }

    shakeHand(): void {
        if (this.utils.isNull(this.ws) || this.ws.readyState != WebSocket.OPEN) return;
        this.ws.send(this.localStorageService.realPerson.TokenId);

        /**
         *  for (var enumMember in WsNotifyTypes) {
             this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'NotifyRefresh': parseInt(enumMember, 10) }));
         }
         */
    }

    disconnect(): void {
        this.isConnected = false;

        if (this.utils.isNotNull(this.ws) && this.ws.readyState != WebSocket.CLOSED) {
            this.ws.close();
        }
        this.ws = null;
    }

    reConnect(): void {
        this.subscriptionReconnect = this.timerReconnect.subscribe(
            x => {
                if (this.utils.isNotNull(this.ws) && this.ws.readyState == WebSocket.CLOSED) {
                    this.connect();
                }
            }
        );
    }

    getNotificationSummary(): void {
        let subscribeGetNotificationSummary = this.personService.getNotificationSummary().subscribe(
            x => {
                this.utils.unsubs(subscribeGetNotificationSummary);

                if (x.IsSuccess) {
                    Stc.notificationSummaryDto = x.Dto;

                    this.personService.calculateNotifyTotals();

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, 'PersonNotificationSummary');
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.utils.unsubs(subscribeGetNotificationSummary);
            }
        );
    }
}