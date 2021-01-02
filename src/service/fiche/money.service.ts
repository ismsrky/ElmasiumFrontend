import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { FicheMoneyListDto } from '../../dto/fiche/money/list.dto';
import { FicheMoneyGetCriteriaDto } from '../../dto/fiche/money/getlist-criteria.dto.ts';
import { UtilService } from '../sys/util.service';

@Injectable()
export class FicheMoneyService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('FicheMoney');
    }

    getList(criteriaDto: FicheMoneyGetCriteriaDto): Observable<ResponseGenDto<FicheMoneyListDto[]>> {
        return super.post('GetList', criteriaDto);
    }
}