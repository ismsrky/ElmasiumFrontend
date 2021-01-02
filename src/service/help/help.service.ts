import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { HelpGetListCriteriaDto } from '../../dto/help/getlist-criteria.dto';
import { HelpListDto } from '../../dto/help/list.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class HelpService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Help');
    }

    getList(criteriaDto: HelpGetListCriteriaDto): Observable<ResponseGenDto<HelpListDto[]>> {
        return super.post('GetList', criteriaDto);
    }
}