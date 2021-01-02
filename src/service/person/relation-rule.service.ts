import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { PersonRelationRuleListDto } from '../../dto/person/relation/rule-list.dto';
import { PersonRelationRuleGetListCriteriaDto } from '../../dto/person/relation/rule-getlist-criteria.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class PersonRelationRuleService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('PersonRelationRule');
    }

    getList(criteriaDto: PersonRelationRuleGetListCriteriaDto): Observable<ResponseGenDto<PersonRelationRuleListDto[]>> {
        return super.post('GetList', criteriaDto);
    }
}