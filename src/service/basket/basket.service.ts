import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { UtilService } from '../sys/util.service';
import { BasketDeleteDto } from '../../dto/basket/delete.dto';
import { BasketListDto } from '../../dto/basket/list.dto';
import { BasketGetListCriteriaDto } from '../../dto/basket/getlist-criteria.dto';

@Injectable()
export class BasketService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Basket');
    }

    getList(criteriaDto: BasketGetListCriteriaDto): Observable<ResponseGenDto<BasketListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    delete(deleteDto: BasketDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }
}