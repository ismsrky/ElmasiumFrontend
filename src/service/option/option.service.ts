import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { UtilService } from '../sys/util.service';
import { OptionGetListCriteriaDto } from '../../dto/option/getlist-criteria.dto';
import { OptionListDto } from '../../dto/option/list.dto';
import { OptionSaveDto } from '../../dto/option/save.dto';
import { PersonProductOptionDto } from '../../dto/person/product/option.dto';
import { OptionGroupGetListCriteriaDto } from '../../dto/option/group-getlist-criteria.dto';
import { OptionGroupListDto } from '../../dto/option/group-list.dto';

@Injectable()
export class OptionService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Option');
    }

    getList(criteriaDto: OptionGetListCriteriaDto): Observable<ResponseGenDto<OptionListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    getGroupList(criteriaDto: OptionGroupGetListCriteriaDto): Observable<ResponseGenDto<OptionGroupListDto[]>> {
        return super.post('GetGroupList', criteriaDto);
    }

    save(saveDto: OptionSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    savePersonProduct(saveDto: PersonProductOptionDto): Observable<ResponseDto> {
        return super.post('SavePersonProduct', saveDto);
    }
}