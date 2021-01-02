import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { NotificationListDto } from '../../dto/notification/list.dto';
import { NotificationSeenDto } from '../../dto/notification/seen.dto';
import { NotificationGetListCriteriaDto } from '../../dto/notification/getlist-criteria.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class NotificationService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Notification');
    }

    getList(criteriaDto: NotificationGetListCriteriaDto): Observable<ResponseGenDto<NotificationListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    seen(seenDto: NotificationSeenDto): Observable<ResponseDto> {
        return super.post('Seen', seenDto);
    }
}