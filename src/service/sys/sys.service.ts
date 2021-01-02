import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { UtilService } from '../sys/util.service';
import { Router } from '@angular/router';
import { SysVersionDto } from '../../dto/sys/version.dto';
import { SysVersionGetLatestCriteriaDto } from '../../dto/sys/version-getlatest-criteria.dto';

@Injectable()
export class SysService extends BaseService {
    constructor(
        private router: Router,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {

        super(http, localStorageService, utils);
        super.setControllerName('Sys');
    }

    getLatestVersion(criteriaDto: SysVersionGetLatestCriteriaDto): Observable<ResponseGenDto<SysVersionDto>> {
        return super.post('GetLatestVersion', criteriaDto);
    }
}