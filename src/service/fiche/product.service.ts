import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { FicheProductListDto } from '../../dto/fiche/product/list.dto';
import { FicheProductGetListCriteriaDto } from '../../dto/fiche/product/getlist-criteria.dto';
import { FicheDto } from '../../dto/fiche/fiche.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class FicheProductService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('FicheProduct');
    }

    getList(criteriaDto: FicheProductGetListCriteriaDto): Observable<ResponseGenDto<FicheProductListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    updateProducts(ficheDto: FicheDto): Observable<ResponseDto> {
        return super.post('UpdateProducts', ficheDto);
    }
}