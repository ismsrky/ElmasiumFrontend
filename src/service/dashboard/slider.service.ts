import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { UtilService } from '../sys/util.service';
import { Router } from '@angular/router';

import { DashboardSliderGetListCriteriaDto } from '../../dto/dashboard/slider/getlist-criteria.dto';
import { DashboardSliderListDto } from '../../dto/dashboard/slider/list.dto';
import { DashboardSliderGroupListDto } from '../../dto/dashboard/slider/group-list.dto';

@Injectable()
export class DashboardSliderService extends BaseService {
    constructor(
        private router: Router,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {

        super(http, localStorageService, utils);
        super.setControllerName('DashboardSlider');
    }

    getGroupList(): Observable<ResponseGenDto<DashboardSliderGroupListDto[]>> {
        return super.post('GetGroupList', null);
    }

    getList(criteriaDto: DashboardSliderGetListCriteriaDto): Observable<ResponseGenDto<DashboardSliderListDto[]>> {
        return super.post('GetList', criteriaDto);
    }
}