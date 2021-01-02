import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { PersonGetListCriteriaDto } from '../../dto/person/getlist-criteria.dto';
import { PersonListDto } from '../../dto/person/list.dto';
import { PersonChangeSelectedCurrencyDto } from '../../dto/person/change-currency.dto';
import { PersonChangeMyPersonDto } from '../../dto/person/change-myperson.dto';
import { PersonNotificationSummaryDto } from '../../dto/person/notification-summary.dto';
import { MenuDto } from '../../dto/menu/menu.dto';
import { Stc } from '../../stc';
import { PersonNavMenuDto } from '../../dto/person/nav-menu.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class PersonService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Person');
    }

    getList(criteriaDto: PersonGetListCriteriaDto): Observable<ResponseGenDto<PersonListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    getNotificationSummary(): Observable<ResponseGenDto<PersonNotificationSummaryDto>> {
        return super.post('GetNotificationSummary', null);
    }

    changeSelectedCurrency(currencyDto: PersonChangeSelectedCurrencyDto): Observable<ResponseDto> {
        return super.post('ChangeSelectedCurrency', currencyDto);
    }

    changeMyPerson(changeMyPersonDto: PersonChangeMyPersonDto): Observable<ResponseDto> {
        return super.post('ChangeMyPerson', changeMyPersonDto);
    }

    getMenuList(): Observable<ResponseGenDto<MenuDto[]>> {
        return super.post('GetMenuList', null);
    }

    getNavMenuList(): Observable<ResponseGenDto<PersonNavMenuDto[]>> {
        return super.post('GetNavMenuList', null);
    }

    calculateNotifyTotals(): void {
        if (this.utils.isNull(Stc.notificationSummaryDto)) return;

        let ficheIncomings: number = 0;
        let ficheOutgoings: number = 0;

        let relationIncomings: number = 0;
        let relationOutgoings: number = 0;

        if (this.utils.isNotNull(Stc.notificationSummaryDto.xFicheIncomings)) {
            ficheIncomings = Stc.notificationSummaryDto.xFicheIncomings;
        }
        if (this.utils.isNotNull(Stc.notificationSummaryDto.xFicheOutgoings)) {
            ficheOutgoings = Stc.notificationSummaryDto.xFicheOutgoings;
        }

        if (this.utils.isNotNull(Stc.notificationSummaryDto.xRelationIncomings)) {
            relationIncomings = Stc.notificationSummaryDto.xRelationIncomings;
        }
        if (this.utils.isNotNull(Stc.notificationSummaryDto.xRelationOutgoings)) {
            relationOutgoings = Stc.notificationSummaryDto.xRelationOutgoings;
        }

        let orderIncomings: number = 0;
        let orderOutgoings: number = 0;

        let returnIncomings: number = 0;
        let returnOutgoings: number = 0;

        if (this.utils.isNotNull(Stc.notificationSummaryDto.xIncomingOrders)) {
            orderIncomings = Stc.notificationSummaryDto.xIncomingOrders;
        }
        if (this.utils.isNotNull(Stc.notificationSummaryDto.xOutgoingOrders)) {
            orderOutgoings = Stc.notificationSummaryDto.xOutgoingOrders;
        }

        if (this.utils.isNotNull(Stc.notificationSummaryDto.xIncomingOrderReturns)) {
            returnIncomings = Stc.notificationSummaryDto.xIncomingOrderReturns;
        }
        if (this.utils.isNotNull(Stc.notificationSummaryDto.xOutgoingOrderReturns)) {
            returnOutgoings = Stc.notificationSummaryDto.xOutgoingOrderReturns;
        }

        Stc.notificationSummaryDto.TotalIncomings = ficheIncomings + relationIncomings + orderIncomings + returnIncomings;
        Stc.notificationSummaryDto.TotalOutgoing = ficheOutgoings + relationOutgoings + orderOutgoings + returnOutgoings;
    }
}