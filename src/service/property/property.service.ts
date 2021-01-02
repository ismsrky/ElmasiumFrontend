import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { PropertyListDto } from '../../dto/property/list.dto';
import { PropertyGetListCriteriaDto } from '../../dto/property/getlist-criteria.dto';
import { PropertySaveDto } from '../../dto/property/save.dto';
import { UtilService } from '../sys/util.service';
import { PersonProductPropertyDto } from '../../dto/person/product/property.dto';
import { PropertyGroupGetListCriteriaDto } from '../../dto/property/group-getlist-criteria.dto';
import { PropertyGroupListDto } from '../../dto/property/group-list.dto';

@Injectable()
export class PropertyService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Property');
    }

    getList(criteriaDto: PropertyGetListCriteriaDto): Observable<ResponseGenDto<PropertyListDto[]>> {
        return super.post('GetList', criteriaDto);
    }
    getGroupList(criteriaDto: PropertyGroupGetListCriteriaDto): Observable<ResponseGenDto<PropertyGroupListDto[]>> {
        return super.post('GetGroupList', criteriaDto);
    }

    save(saveDto: PropertySaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    savePersonProduct(saveDto: PersonProductPropertyDto): Observable<ResponseDto> {
        return super.post('SavePersonProduct', saveDto);
    }
    deletePersonProduct(deleteDto: PersonProductPropertyDto): Observable<ResponseDto> {
        return super.post('DeletePersonProduct', deleteDto);
    }
}