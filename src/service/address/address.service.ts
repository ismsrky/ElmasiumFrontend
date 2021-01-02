import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseService } from '../sys/base.service';
import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';

import { AddressCountryDto } from '../../dto/address/country.dto';
import { AddressStateDto } from '../../dto/address/state.dto';
import { AddressCityDto } from '../../dto/address/city.dto';
import { AddressDistrictDto } from '../../dto/address/district.dto';
import { AddressGetStateListCriteriaDto } from '../../dto/address/getstatelist-criteria.dto';
import { AddressGetCityListCriteriaDto } from '../../dto/address/getcitylist-criteria.dto';
import { AddressLocalityDto } from '../../dto/address/locality.dto';
import { UtilService } from '../sys/util.service';
import { AddressGetDistrictListCriteriaDto } from '../../dto/address/getdistrictlist-criteria.dto';
import { AddressGetLocalityListCriteriaDto } from '../../dto/address/getlocalitylist-criteria.dto';

@Injectable()
export class AddressService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Address');
    }

    getCountryList(): Observable<ResponseGenDto<AddressCountryDto[]>> {
        return super.post('GetCountryList', null);
    }

    getStateList(criteriaDto: AddressGetStateListCriteriaDto): Observable<ResponseGenDto<AddressStateDto[]>> {
        return super.post('GetStateList', criteriaDto);
    }

    getCityList(criteriaDto: AddressGetCityListCriteriaDto): Observable<ResponseGenDto<AddressCityDto[]>> {
        return super.post('GetCityList', criteriaDto);
    }

    getDistrictList(criteriaDto: AddressGetDistrictListCriteriaDto): Observable<ResponseGenDto<AddressDistrictDto[]>> {
        return super.post('GetDistrictList', criteriaDto);
    }

    getLocalityList(criteriaDto: AddressGetLocalityListCriteriaDto): Observable<ResponseGenDto<AddressLocalityDto[]>> {
        return super.post('GetLocalityList', criteriaDto);
    }
}