import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { UtilService } from '../sys/util.service';

import { IncludeExcludeGetListCriteriaDto } from '../../dto/include-exclude/getlist-criteria.dto';
import { IncludeExcludeDto } from '../../dto/include-exclude/include-exclude.dto';
import { IncludeExcludeSaveDto } from '../../dto/include-exclude/save.dto';
import { PersonProductIncludeExcludeDto } from '../../dto/person/product/include-exclude.dto';

@Injectable()
export class IncludeExcludeService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('IncludeExclude');
    }

    getList(criteriaDto: IncludeExcludeGetListCriteriaDto): Observable<ResponseGenDto<IncludeExcludeDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    save(saveDto: IncludeExcludeSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    saveAll(saveDto: IncludeExcludeSaveDto): Observable<ResponseDto> {
        return super.post('SaveAll', saveDto);
    }

    savePersonProduct(saveDto: PersonProductIncludeExcludeDto): Observable<ResponseDto> {
        return super.post('SavePersonProduct', saveDto);
    }
}