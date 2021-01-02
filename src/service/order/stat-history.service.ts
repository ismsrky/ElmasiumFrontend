import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { UtilService } from '../sys/util.service';
import { Router } from '@angular/router';
import { OrderStatHistoryDto } from '../../dto/order/stat-history/stat-history.dto';
import { OrderStatHistoryGetCriteriaDto } from '../../dto/order/stat-history/get-criteria.dto';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { OrderStatHistoryGetListCriteriaDto } from '../../dto/order/stat-history/getlist-criteria.dto';
import { OrderStatHistoryListDto } from '../../dto/order/stat-history/list.dto';
import { ModalOrderStatHistorySaveBo } from '../../bo/modal/order-stat-history-save.bo';

@Injectable()
export class OrderStatHistoryService extends BaseService {
    constructor(
        private router: Router,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {

        super(http, localStorageService, utils);
        super.setControllerName('OrderStatHistory');
    }

    save(saveDto: OrderStatHistoryDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    get(criteriaDto: OrderStatHistoryGetCriteriaDto): Observable<ResponseGenDto<OrderStatHistoryDto>> {
        return super.post('Get', criteriaDto);
    }

    getList(criteriaDto: OrderStatHistoryGetListCriteriaDto): Observable<ResponseGenDto<OrderStatHistoryListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    showModal(statHistorySaveBo: ModalOrderStatHistorySaveBo): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({ 'OrderStatHistoryCrudComp': { 'statHistorySaveBo': statHistorySaveBo } }));
    }
}