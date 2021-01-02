import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';

import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';
import { DictionaryDto } from '../../dto/dictionary/dictionary.dto';
import { DictionaryGetListCriteriaDto } from '../../dto/dictionary/getlist-criteria.dto';
import { RealPersonDto } from '../../dto/person/real/real-person.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class RealPersonService extends BaseService {
  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private utils: UtilService) {

    super(http, localStorageService, utils);
    super.setControllerName('RealPerson');
  }

  get(): Observable<ResponseGenDto<RealPersonDto>> {
    return super.post('Get', null);
  }

  update(realpersonDto: RealPersonDto): Observable<ResponseDto> {
    return super.post('Update', realpersonDto);
  }

  changeLanguage(criteriaDto: DictionaryGetListCriteriaDto): Observable<ResponseGenDto<DictionaryDto[]>> {
    return super.post('ChangeLanguage', criteriaDto);
  }
}