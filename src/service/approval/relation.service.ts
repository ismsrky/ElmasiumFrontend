import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { ApprovalRelationSaveDto } from '../../dto/approval/relation/save.dto';
import { ApprovalRelationListDto } from '../../dto/approval/relation/list.dto';
import { ApprovalRelationRequestDto } from '../../dto/approval/relation/request.dto';
import { ApprovalRelationGetListCriteriaDto } from '../../dto/approval/relation/getlist-criteria.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class ApprovalRelationService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('ApprovalRelation');
    }

    save(saveDto: ApprovalRelationSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    makeRequest(requestDto: ApprovalRelationRequestDto): Observable<ResponseDto> {
        return super.post('MakeRequest', requestDto);
    }

    getList(criteriaDto: ApprovalRelationGetListCriteriaDto): Observable<ResponseGenDto<ApprovalRelationListDto[]>> {
        return super.post('GetList', criteriaDto);
    }
}