import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { UtilService } from '../sys/util.service';
import { OrderSaveDto } from '../../dto/order/save.dto';
import { Router } from '@angular/router';
import { AppRoutes } from '../../enum/sys/routes.enum';
import { OrderReturnSaveDto } from '../../dto/order/return-save.dto';
import { OrderListDto } from '../../dto/order/list.dto';
import { OrderGetListCriteriaDto } from '../../dto/order/getlist-criteria.dto';
import { OrderStatNextListDto } from '../../dto/order/stat-next-list.dto';
import { OrderStatListDto } from '../../dto/order/stat-list.dto';

@Injectable()
export class OrderService extends BaseService {
    constructor(
        private router: Router,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {

        super(http, localStorageService, utils);
        super.setControllerName('Order');
    }

    save(saveDto: OrderSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    saveReturn(saveDto: OrderReturnSaveDto): Observable<ResponseDto> {
        return super.post('SaveReturn', saveDto);
    }

    getList(criteriaDto: OrderGetListCriteriaDto): Observable<ResponseGenDto<OrderListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    getStatNextList(): Observable<ResponseGenDto<OrderStatNextListDto[]>> {
        return super.post('GetStatNextList', null);
    }

    getStatList(): Observable<ResponseGenDto<OrderStatListDto[]>> {
        return super.post('GetStatList', null);
    }

    goToCreateOrder(basketId: number): void {
        this.router.navigate(['/' + AppRoutes.createOrder], { queryParams: { basketId: basketId } });
    }
}