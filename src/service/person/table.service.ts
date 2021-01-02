import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { UtilService } from '../sys/util.service';

import { PersonTableGroupDto } from '../../dto/person/table/group.dto';
import { PersonTableGroupGetCriteriaDto } from '../../dto/person/table/group-get-criteria.dto';
import { PersonTableGroupDeleteDto } from '../../dto/person/table/group-delete.dto';
import { PersonTableGroupGetListCriteriaDto } from '../../dto/person/table/group-getlist-criteria.dto';
import { PersonTableGroupListDto } from '../../dto/person/table/group-list.dto';
import { PersonTableDto } from '../../dto/person/table/table.dto';
import { PersonTableGetCriteriaDto } from '../../dto/person/table/get-criteria.dto';
import { PersonTableDeleteDto } from '../../dto/person/table/delete.dto';
import { PersonTableGetListCriteriaDto } from '../../dto/person/table/getlist-criteria.dto';
import { PersonTableListDto } from '../../dto/person/table/list.dto';

@Injectable()
export class PersonTableService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {

        super(http, localStorageService, utils);
        super.setControllerName('PersonTable');
    }

    save(saveDto: PersonTableDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    get(criteriaDto: PersonTableGetCriteriaDto): Observable<ResponseGenDto<PersonTableDto>> {
        return super.post('Get', criteriaDto);
    }

    delete(deleteDto: PersonTableDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }

    getList(criteriaDto: PersonTableGetListCriteriaDto): Observable<ResponseGenDto<PersonTableListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    saveGroup(saveDto: PersonTableGroupDto): Observable<ResponseDto> {
        return super.post('SaveGroup', saveDto);
    }

    getGroup(criteriaDto: PersonTableGroupGetCriteriaDto): Observable<ResponseGenDto<PersonTableGroupDto>> {
        return super.post('GetGroup', criteriaDto);
    }

    deleteGroup(deleteDto: PersonTableGroupDeleteDto): Observable<ResponseDto> {
        return super.post('DeleteGroup', deleteDto);
    }

    getGroupList(criteriaDto: PersonTableGroupGetListCriteriaDto): Observable<ResponseGenDto<PersonTableGroupListDto[]>> {
        return super.post('GetGroupList', criteriaDto);
    }   
}