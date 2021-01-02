import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { PersonProductActivityGetListCriteriaDto } from '../../dto/person/product/activity-getlist-criteria.dto';
import { PersonProductActivityListDto } from '../../dto/person/product/activity-list.dto';
import { PersonProductGetCriteriaDto } from '../../dto/person/product/get-criteria.dto';
import { PersonProductDto } from '../../dto/person/product/product.dto';
import { PersonProductGetListCriteriaDto } from '../../dto/person/product/getlist-criteria.dto';
import { PersonProductListDto } from '../../dto/person/product/list.dto';
import { UtilService } from '../sys/util.service';
import { PersonProductProfileDto } from '../../dto/person/product/profile.dto';
import { PersonProductProfileGetCriteriaDto } from '../../dto/person/product/profile-get-criteria.dto';
import { PersonProductUpdateDto } from '../../dto/person/product/update.dto';
import { PersonProductGeneralDto } from '../../dto/person/product/general.dto';
import { PersonProductGeneralGetCriteriaDto } from '../../dto/person/product/general-get-criteria.dto';
import { PersonProductSeePriceDto } from '../../dto/person/product/see-price.dto';
import { PersonProductSeePriceGetCriteriaDto } from '../../dto/person/product/see-price-get-criteria.dto';
import { PersonProductAddInventoryDto } from '../../dto/person/product/add-inventory.dto';
import { PersonProductCategoryGetListCriteriaDto } from '../../dto/person/product/category-getlist-criteria.dto';
import { ProductCategoryListDto } from '../../dto/product/category/list.dto';
import { PersonProfileProductGetListCriteriaDto } from '../../dto/person/product/profile-getlist-criteria.dto';
import { PersonProfileProductListDto } from '../../dto/person/product/profile-list.dto';
import { PersonProductDeleteDto } from '../../dto/person/product/delete.dto';

@Injectable()
export class PersonProductService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('PersonProduct');
    }

    get(criteriaDto: PersonProductGetCriteriaDto): Observable<ResponseGenDto<PersonProductDto>> {
        return super.post('Get', criteriaDto);
    }

    delete(deleteDto: PersonProductDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }

    getList(criteriaDto: PersonProductGetListCriteriaDto): Observable<ResponseGenDto<PersonProductListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    getGeneral(criteriaDto: PersonProductGeneralGetCriteriaDto): Observable<ResponseGenDto<PersonProductGeneralDto>> {
        return super.post('GetGeneral', criteriaDto);
    }

    addToInventory(addDto: PersonProductAddInventoryDto): Observable<ResponseDto> {
        return super.post('AddToInventory', addDto);
    }

    update(updateDto: PersonProductUpdateDto): Observable<ResponseDto> {
        return super.post('Update', updateDto);
    }

    getActivityList(criteriaDto: PersonProductActivityGetListCriteriaDto): Observable<ResponseGenDto<PersonProductActivityListDto[]>> {
        return super.post('GetActivityList', criteriaDto);
    }

    getProfile(criteriaDto: PersonProductProfileGetCriteriaDto): Observable<ResponseGenDto<PersonProductProfileDto>> {
        return super.post('GetProfile', criteriaDto);
    }

    getSeePrice(criteriaDto: PersonProductSeePriceGetCriteriaDto): Observable<ResponseGenDto<PersonProductSeePriceDto>> {
        return super.post('GetSeePrice', criteriaDto);
    }

    getCategoryList(criteriaDto: PersonProductCategoryGetListCriteriaDto): Observable<ResponseGenDto<ProductCategoryListDto[]>> {
        return super.post('GetCategoryList', criteriaDto);
    }

    getListForProfile(criteriaDto: PersonProfileProductGetListCriteriaDto): Observable<ResponseGenDto<PersonProfileProductListDto[]>> {
        return super.post('GetListForProfile', criteriaDto);
    }
}