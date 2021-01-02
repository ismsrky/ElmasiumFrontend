import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { UtilService } from '../sys/util.service';
import { NotificationPreferenceListDto } from '../../dto/notification/preference/list.dto';
import { NotificationPreferenceSaveDto } from '../../dto/notification/preference/save.dto';

@Injectable()
export class NotificationPreferenceService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('NotificationPreference');
    }

    getList(): Observable<ResponseGenDto<NotificationPreferenceListDto[]>> {
        return super.post('GetList', null);
    }

    save(saveDto: NotificationPreferenceSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }
}