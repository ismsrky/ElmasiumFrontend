import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { WarningDto } from '../../dto/warning/warning.dto';
import { WarningCheckDto } from '../../dto/warning/check.dto';
import { WarningModuleTypes } from '../../enum/warning/module-types.enum';
import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { UtilService } from '../sys/util.service';

@Injectable()
export class WarningService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Warning');
    }

    save(saveDto: WarningDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    saveCheck(saveCheckDto: WarningCheckDto): Observable<ResponseDto> {
        return super.post('SaveCheck', saveCheckDto);
    }

    showModal(warningModuleTypeId: WarningModuleTypes, refId: number): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({ 'WarningCrudComp': { 'warningModuleTypeId': warningModuleTypeId, 'refId': refId } }));
    }
}