import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { UtilService } from '../sys/util.service';

import { PersonVerifyPhoneGenReturnDto } from '../../dto/person/verify-phone/gen-return.dto';
import { PersonVerifyPhoneGenDto } from '../../dto/person/verify-phone/gen.dto';
import { PersonVerifyPhoneSaveDto } from '../../dto/person/verify-phone/save.dto';
import { ModalPersonVerifyPhoneBo } from '../../bo/modal/person-verify-phone.bo';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';

@Injectable()
export class PersonVerifyPhoneService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {

        super(http, localStorageService, utils);
        super.setControllerName('PersonVerifyPhone');
    }

    gen(genDto: PersonVerifyPhoneGenDto): Observable<ResponseGenDto<PersonVerifyPhoneGenReturnDto>> {
        return super.post('Gen', genDto);
    }

    save(saveDto: PersonVerifyPhoneSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    isVerified(genDto: PersonVerifyPhoneGenDto): Observable<ResponseDto> {
        return super.post('IsVerified', genDto);
    }

    showModal(personVerifyPhoneBo: ModalPersonVerifyPhoneBo): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({
            'PersonVerifyPhoneComp':
                { 'personVerifyPhoneBo': personVerifyPhoneBo }
        }));
    }
}