import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { PosProductShortCutGroupListDto } from '../../dto/pos/product-shortcut-group-list.dto';
import { PosProductShortCutDto } from '../../dto/pos/product-shortcut.dto';
import { PosProductShortCutGroupDto } from '../../dto/pos/product-shortcut-group.dto';
import { UtilService } from '../sys/util.service';

@Injectable()
export class PosService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Pos');
    }

    getShortCutList(shopId: number): Observable<ResponseGenDto<PosProductShortCutGroupListDto[]>> {
        return super.post('GetShortCutList', { 'shopId': shopId });
    }

    saveShortCut(posProductShortCutDto: PosProductShortCutDto): Observable<ResponseDto> {
        return super.post('SaveShortCut', posProductShortCutDto);
    }
    deleteShortCut(posProductShortCutDto: PosProductShortCutDto): Observable<ResponseDto> {
        return super.post('DeleteShortCut', posProductShortCutDto);
    }

    saveShortCutgroup(posProductShortCutGroupDto: PosProductShortCutGroupDto): Observable<ResponseDto> {
        return super.post('SaveShortCutGroup', posProductShortCutGroupDto);
    }
    deleteShortCutGroup(posProductShortCutGroupDto: PosProductShortCutGroupDto): Observable<ResponseDto> {
        return super.post('DeleteShortCutGroup', posProductShortCutGroupDto);
    }
}