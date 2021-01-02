import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LanguageDto } from '../../dto/dictionary/language.dto';

import { BaseService } from '../sys/base.service';
import { LocalStorageService } from '../sys/local-storage.service';
import { UtilService } from '../sys/util.service';

@Injectable()
export class LanguageService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Language');
    }

    public get BrowserLang(): LanguageDto {
        const browserLangCode: string = window.navigator.language;
        let lang = new LanguageDto();
        if (browserLangCode == 'tr') {
            lang.Id = 0;
            lang.Name = 'Türkçe';
            lang.CultureCode = 'tr';
        } else if (browserLangCode.startsWith('en')) {
            lang.Id = 1;
            lang.Name = 'Enlish';
            lang.CultureCode = 'en';
        } else {
            lang.Id = 0;
            lang.Name = 'Türkçe';
            lang.CultureCode = 'tr';
        }

        return lang
    }

    getList(): Observable<ResponseGenDto<LanguageDto[]>> {
        return super.post('GetList', null);
    }
}