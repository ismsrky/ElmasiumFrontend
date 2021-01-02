import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { PersonAddressDto } from '../../dto/person/address/address.dto';
import { PersonAddressListDto } from '../../dto/person/address/address-list.dto';
import { PersonAddressGetListCriteriaDto } from '../../dto/person/address/getlist-criteria.dto';
import { PersonAddressGetCriteriaDto } from '../../dto/person/address/get-criteria.dto';
import { PersonAddressDeleteDto } from '../../dto/person/address/delete.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class PersonAddressService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('PersonAddress');
    }

    get(criteriaDto: PersonAddressGetCriteriaDto): Observable<ResponseGenDto<PersonAddressDto>> {
        return super.post('Get', criteriaDto);
    }

    getList(criteriaDto: PersonAddressGetListCriteriaDto): Observable<ResponseGenDto<PersonAddressListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    save(saveDto: PersonAddressDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    delete(deleteDto: PersonAddressDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }
}