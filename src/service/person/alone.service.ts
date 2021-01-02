import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';

import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';
import { AlonePersonDto } from '../../dto/person/alone/alone.dto';
import { AlonePersonGetCriteriaDto } from '../../dto/person/alone/get-criteria.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class AlonePersonService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('AlonePerson');
    }

    get(criteriaDto: AlonePersonGetCriteriaDto): Observable<ResponseGenDto<AlonePersonDto>> {
        return super.post('Get', criteriaDto);
    }

    save(saveDto: AlonePersonDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }
}