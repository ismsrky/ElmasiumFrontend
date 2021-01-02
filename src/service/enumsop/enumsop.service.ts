import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { ShopTypeGroupDto } from '../../dto/enumsOp/shop-type-group.dto';

import { BaseService } from '../sys/base.service';
import { LocalStorageService } from '../sys/local-storage.service';
import { CurrenciesDto } from '../../dto/enumsOp/currencies.dto';
import { FicheContentGroupBo } from '../../bo/fiche/fiche-content-group.bo';
import { LanguageDto } from '../../dto/dictionary/language.dto';
import { FicheTypeFakeDto } from '../../dto/fiche/type-fake.dto';
import { PersonTypes } from '../../enum/person/person-types.enum';
import { UtilService } from '../sys/util.service';

@Injectable()
export class EnumsOpService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('EnumsOp');
    }

    getShopTypeList(): Observable<ResponseGenDto<ShopTypeGroupDto[]>> {
        return super.post('GetShopTypeList', null);
    }

    getCurrencyList(): Observable<CurrenciesDto[]> {
        return this.http.get<CurrenciesDto[]>('/assets/raw/currencies.dto.json');
        //return super.post('GetCurrencyList', null); This takes data from service. Do not remove.
    }

    getFicheContentList(): Observable<FicheContentGroupBo[]> {
        return this.http.get<FicheContentGroupBo[]>('/assets/raw/fiche-content.json');
    }

    getLanguages(): Observable<LanguageDto[]> {
        return this.http.get<LanguageDto[]>('/assets/raw/languages.dto.json');
    }

    getFicheFakeTypes(): Observable<FicheTypeFakeDto[]> {
        return this.http.get<FicheTypeFakeDto[]>('/assets/raw/fiche-type-fakes.dto.json');
    }
}