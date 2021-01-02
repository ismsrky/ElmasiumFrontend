import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { PersonRelationListDto } from '../../dto/person/relation/list.dto';
import { PersonRelationGetListCriteriaDto } from '../../dto/person/relation/getlist-criteria.dto';
import { PersonRelationFindGetListCriteriaDto } from '../../dto/person/relation/find/getlist-criteria.dto';
import { PersonRelationFindListDto } from '../../dto/person/relation/find/list.dto';
import { RelationTypes } from '../../enum/person/relation-types.enum';
import { PersonRelationDeleteDto } from '../../dto/person/relation/delete.dto';
import { PersonRelationAvaibleTypeGetListCriteriaDto } from '../../dto/person/relation/avaible-getlist-criteria.dto';
import { Stc } from '../../stc';
import { UtilService } from '../sys/util.service';
import { PersonRelationHasCriteriaDto } from '../../dto/person/relation/has-criteria.dto';

@Injectable()
export class PersonRelationService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('PersonRelation');
    }

    getList(criteriaDto: PersonRelationGetListCriteriaDto): Observable<ResponseGenDto<PersonRelationListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    getFindList(criteriaDto: PersonRelationFindGetListCriteriaDto): Observable<ResponseGenDto<PersonRelationFindListDto[]>> {
        return super.post('GetFindList', criteriaDto);
    }

    getAvaibleTypeList(criteriaDto: PersonRelationAvaibleTypeGetListCriteriaDto): Observable<ResponseGenDto<RelationTypes[]>> {
        return super.post('GetAvaibleTypeList', criteriaDto);
    }

    delete(deleteDto: PersonRelationDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }

    has(relationTypeId: RelationTypes, personId1: number, personId2: number=null): Observable<ResponseDto> {
        const criteriaDto = new PersonRelationHasCriteriaDto();
        criteriaDto.RelationTypeId = relationTypeId;
        criteriaDto.PersonId1 = personId1;
        criteriaDto.PersonId2 = personId2;
        return super.post('Has', criteriaDto);
    }

    // inside
    hasRelationIn(relationTypeId: RelationTypes, relationTypeId2: RelationTypes = null, relationTypeId3: RelationTypes = null): boolean {
        let result: boolean = false;
        const profile = this.localStorageService.personProfile;

        if (this.utils.isNull(profile.RelationTypeIdList) || profile.RelationTypeIdList.length == 0) return false;

        if (profile.RelationTypeIdList.includes(relationTypeId)) {
            result = true;
        } else if (this.utils.isNotNull(relationTypeId2) && profile.RelationTypeIdList.includes(relationTypeId2)) {
            result = true;
        } else if (this.utils.isNotNull(relationTypeId3) && profile.RelationTypeIdList.includes(relationTypeId3)) {
            result = true;
        }

        // TODO: get this info from service later. Service will check this anyway.
        return true;
    }

    // inside
    getAddAsText(relationTypeId: RelationTypes, amIParent: boolean): string {
        let result: string = null;

        switch (relationTypeId) {
            case RelationTypes.xCustomer:
                result = amIParent ? 'xAddedAsCustomer' : 'xAddedYouAsCustomer';
                break;
            case RelationTypes.xFriend:
                result = amIParent ? 'xAddedAsFriend' : 'xAddedYouAsFriend';
                break;
            case RelationTypes.xStaff:
                result = amIParent ? 'xAddedAsStaff' : 'xAddedYouAsStaff';
                break;
            case RelationTypes.xSeller:
                result = 'xAddedAsSeller';
                break;
            case RelationTypes.xShopOwner:
                result = amIParent ? 'xAddedAsShopOwner' : 'xAddedYouAsShopOwner';
                break;
            default:
                result = 'Merhaba';
                break;
        }

        return result;
    }
}