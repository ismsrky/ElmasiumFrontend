import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { ProductCodeListDto } from '../../dto/product/code/list.dto';
import { ProductCodeGetListCriteriaDto } from '../../dto/product/code/getlist-criteria.dto';
import { ProductCodeDto } from '../../dto/product/code/code.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class ProductCodeService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('ProductCode');
    }

    getList(criteriaDto: ProductCodeGetListCriteriaDto): Observable<ResponseGenDto<ProductCodeListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    save(saveDto: ProductCodeDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }
}