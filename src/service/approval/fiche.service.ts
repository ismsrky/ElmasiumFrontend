import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { ApprovalFicheSaveDto } from '../../dto/approval/fiche/save.dto';
import { ApprovalFicheListDto } from '../../dto/approval/fiche/list.dto';
import { ApprovalFicheGetListCriteriaDto } from '../../dto/approval/fiche/getlist-criteria.dto';
import { ApprovalStats } from '../../enum/approval/stats.enum';
import { UtilService } from '../sys/util.service';

@Injectable()
export class ApprovalFicheService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('ApprovalFiche');
    }

    save(saveDto: ApprovalFicheSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    getList(criteriaDto: ApprovalFicheGetListCriteriaDto): Observable<ResponseGenDto<ApprovalFicheListDto[]>> {
        return super.post('GetList', criteriaDto);
    }
}