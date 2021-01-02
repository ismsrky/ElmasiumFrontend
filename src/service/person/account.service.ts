import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { PersonAccountDto } from '../../dto/person/account/account.dto';
import { PersonAccountListDto } from '../../dto/person/account/list.dto';
import { PersonAccountGetListCriteriaDto } from '../../dto/person/account/getlist-criteria.dto';

import { PersonAccountActivityListDto } from '../../dto/person/account/activity-list.dto';
import { PersonAccountActivityGetListCriteriaDto } from '../../dto/person/account/activity-getlist-criteria.dto';
import { PersonAccountGetCriteriaDto } from '../../dto/person/account/get-criteria.dto';
import { PersonAccountDeleteDto } from '../../dto/person/account/delete.dto';
import { PersonAccountGetFastRetailCriteriaDto } from '../../dto/person/account/getfastretail-criteria.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class PersonAccountService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('PersonAccount');
    }

    get(criteriaDto: PersonAccountGetCriteriaDto): Observable<ResponseGenDto<PersonAccountDto>> {
        return super.post('Get', criteriaDto);
    }

    getList(criteriaDto: PersonAccountGetListCriteriaDto): Observable<ResponseGenDto<PersonAccountListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    save(personAddressDto: PersonAccountDto): Observable<ResponseDto> {
        return super.post('Save', personAddressDto);
    }

    delete(deleteDto: PersonAccountDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }

    getActivityList(criteriaDto: PersonAccountActivityGetListCriteriaDto): Observable<ResponseGenDto<PersonAccountActivityListDto[]>> {
        return super.post('GetActivityList', criteriaDto);
    }


    getFastRetail(criteriaDto: PersonAccountGetFastRetailCriteriaDto): Observable<ResponseDto> {
        return super.post('GetFastRetail', criteriaDto);
    }
}