import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { BaseService } from '../sys/base.service';
import { LocalStorageService } from '../sys/local-storage.service';

import { RegisterShopDto } from '../../dto/person/shop/register-shop.dto';
import { ShopGeneralDto } from '../../dto/person/shop/general.dto';
import { ShopWorkingHoursDto } from '../../dto/person/shop/working-hours.dto';
import { ShopProfileGetCriteriaDto } from '../../dto/person/shop/profile-get-criteria.dto';
import { ShopProfileDto } from '../../dto/person/shop/profile.dto';
import { ShopOrderGeneralDto } from '../../dto/person/shop/order-general.dto';
import { ShopOrderAreaDto } from '../../dto/person/shop/order-area.dto';
import { ShopOrderAreaGetListCriteriaDto } from '../../dto/person/shop/order-area-getlist-criteria.dto';
import { ShopOrderAreaListDto } from '../../dto/person/shop/order-area-list.dto';
import { ShopOrderAreaGetCriteriaDto } from '../../dto/person/shop/order-area-get-criteria.dto';
import { ShopOrderAreaDeleteDto } from '../../dto/person/shop/order-area-delete.dto';
import { ShopOrderAreaSubDeleteDto } from '../../dto/person/shop/order-area-sub-delete.dto';
import { ShopOrderGeneralGetCriteriaDto } from '../../dto/person/shop/order-general-get-criteria.dto';
import { ShopWorkingHoursGetCriteriaDto } from '../../dto/person/shop/working-hours-get-criteria.dto';
import { ShopGeneralGetCriteriaDto } from '../../dto/person/shop/general-get-criteria.dto';
import { UtilService } from '../sys/util.service';
import { ShopOrderAccountGetListCriteriaDto } from '../../dto/person/shop/order-account-getlist-criteria.dto';
import { ShopOrderAccountListDto } from '../../dto/person/shop/order-account-list.dto';

@Injectable()
export class ShopPersonService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('ShopPerson');
    }

    register(registerShopDto: RegisterShopDto): Observable<ResponseDto> {
        return super.post('Register', registerShopDto);
    }

    fullNameExists(fullname: string): Observable<ResponseDto> {
        return super.post('FullNameExists', { 'fullname': fullname });
    }

    updateGeneral(updateDto: ShopGeneralDto): Observable<ResponseDto> {
        return super.post('UpdateGeneral', updateDto);
    }
    getGeneral(criteriaDto: ShopGeneralGetCriteriaDto): Observable<ResponseGenDto<ShopGeneralDto>> {
        return super.post('GetGeneral', criteriaDto);
    }

    updateWorkingHours(updateDto: ShopWorkingHoursDto): Observable<ResponseDto> {
        return super.post('UpdateWorkingHours', updateDto);
    }
    getWorkingHours(criteriaDto: ShopWorkingHoursGetCriteriaDto): Observable<ResponseGenDto<ShopWorkingHoursDto>> {
        return super.post('GetWorkingHours', criteriaDto);
    }

    getProfile(criteriaDto: ShopProfileGetCriteriaDto): Observable<ResponseGenDto<ShopProfileDto>> {
        return super.post('GetProfile', criteriaDto);
    }

    updateOrderGeneral(updateDto: ShopOrderGeneralDto): Observable<ResponseDto> {
        return super.post('UpdateOrderGeneral', updateDto);
    }
    getOrderGeneral(criteriaDto: ShopOrderGeneralGetCriteriaDto): Observable<ResponseGenDto<ShopOrderGeneralDto>> {
        return super.post('GetOrderGeneral', criteriaDto);
    }

    saveOrderArea(saveDto: ShopOrderAreaDto): Observable<ResponseDto> {
        return super.post('SaveOrderArea', saveDto);
    }
    getOrderAreaList(criteriaDto: ShopOrderAreaGetListCriteriaDto): Observable<ResponseGenDto<ShopOrderAreaListDto[]>> {
        return super.post('GetOrderAreaList', criteriaDto);
    }
    getOrderArea(criteriaDto: ShopOrderAreaGetCriteriaDto): Observable<ResponseGenDto<ShopOrderAreaDto>> {
        return super.post('GetOrderArea', criteriaDto);
    }
    deleteOrderArea(deleteDto: ShopOrderAreaDeleteDto): Observable<ResponseDto> {
        return super.post('DeleteOrderArea', deleteDto);
    }
    deleteOrderAreaSub(deleteDto: ShopOrderAreaSubDeleteDto): Observable<ResponseDto> {
        return super.post('DeleteOrderAreaSub', deleteDto);
    }

    getOrderAccountList(criteriaDto: ShopOrderAccountGetListCriteriaDto): Observable<ResponseGenDto<ShopOrderAccountListDto[]>> {
        return super.post('GetOrderAccountList', criteriaDto);
    }

    parseWorkingHours(valueStr: string): string {
        if (this.utils.isNull(valueStr)) return null;

        if (valueStr == '0') return 'xOpen24Hour';
        if (valueStr == '-1') return 'xClosed';

        if (valueStr.length == 8) {
            return valueStr.substr(0, 2) + ':' + valueStr.substr(2, 2) + ' - ' + valueStr.substr(4, 2) + ':' + valueStr.substr(6, 2);
        }
        return '';
    }
}