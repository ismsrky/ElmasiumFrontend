import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { ReportPersonSummaryGetCriteriaDto } from '../../dto/report/person/getsummary-criteria.dto';
import { ReportPersonSummaryDto } from '../../dto/report/person/summary.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class ReportPersonService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('ReportPerson');
    }

    getSummary(criteriaDto: ReportPersonSummaryGetCriteriaDto): Observable<ResponseGenDto<ReportPersonSummaryDto>> {
        return super.post('GetSummary', criteriaDto);
    }
}