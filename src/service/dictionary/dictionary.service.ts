import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { DictionaryDto } from '../../dto/dictionary/dictionary.dto';

import { BaseService } from '../sys/base.service';
import { LocalStorageService } from '../sys/local-storage.service';
import { DictionaryGetListCriteriaDto } from '../../dto/dictionary/getlist-criteria.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class DictionaryService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Dictionary');
    }

    getList(criteriaDto: DictionaryGetListCriteriaDto): Observable<ResponseGenDto<DictionaryDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    getValue(key: string): string {
        try {
            const dics = this.localStorageService.getDics();

            if (this.utils.isNull(dics)) {
                return key;
            } else {
                return this.returnValue(dics, key);
            }
        } catch (error) {
            return key;
        }
    }
    private returnValue(dics: DictionaryDto[], key: string): string {
        let result = key;
        if (this.utils.isNotNull(dics)) {
            let dic: DictionaryDto = dics.find(x => x.Key == key);
            if (this.utils.isNotNull(dic))
                result = dic.Value;
        }

        return result;
    }
}