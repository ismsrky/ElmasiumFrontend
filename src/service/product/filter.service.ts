import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { ProductFilterGetListCriteriaDto } from '../../dto/product/filter/getlist-criteria.dto';
import { ProductFilterListDto } from '../../dto/product/filter/list.dto';
import { ProductFilterListSummaryDto } from '../../dto/product/filter/list-summary.dto';
import { UtilService } from '../sys/util.service';
import { ProductFilterPoolGetListCriteriaDto } from '../../dto/product/filter/pool-getlist-criteria.dto';
import { ProductFilterPoolListDto } from '../../dto/product/filter/pool-list.dto';
import { ProductFilterGetListExtraCriteriaDto } from '../../dto/product/filter/getlist-extra-criteria.dto';
import { ProductFilterListExtraDto } from '../../dto/product/filter/list-extra.dto';

@Injectable()
export class ProductFilterService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('ProductFilter');
    }

    getList(criteriaDto: ProductFilterGetListCriteriaDto): Observable<ResponseGenDto<ProductFilterListDto[]>> {
        return super.post('GetList', criteriaDto);
    }
    getListExtra(criteriaDto: ProductFilterGetListExtraCriteriaDto): Observable<ResponseGenDto<ProductFilterListExtraDto>> {
        return super.post('GetListExtra', criteriaDto);
    }
    getListSummary(criteriaDto: ProductFilterGetListCriteriaDto): Observable<ResponseGenDto<ProductFilterListSummaryDto>> {
        return super.post('GetListSummary', criteriaDto);
    }

    getPoolList(criteriaDto: ProductFilterPoolGetListCriteriaDto): Observable<ResponseGenDto<ProductFilterPoolListDto[]>> {
        return super.post('GetPoolList', criteriaDto);
    }
}