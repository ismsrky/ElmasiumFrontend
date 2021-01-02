import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { UtilService } from '../sys/util.service';
import { BasketProductSaveDto } from '../../dto/basket/product/save.dto';
import { BasketProductDeleteDto } from '../../dto/basket/product/delete.dto';
import { BasketProductQuantityUpdateDto } from '../../dto/basket/product/quantity-update.dto';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { ModalBasketAddBo } from '../../bo/modal/basket-add.bo';
import { AuthService } from '../auth/auth.service';
import { BasketProductOptionUpdateDto } from '../../dto/basket/product/option-update.dto';
import { BasketProductIncludeExcludeUpdateDto } from '../../dto/basket/product/include-exclude-option-update.dto';

@Injectable()
export class BasketProductService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService,
        private authService: AuthService) {

        super(http, localStorageService, utils);
        super.setControllerName('BasketProduct');
    }

    save(saveDto: BasketProductSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    delete(deleteDto: BasketProductDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }

    updateQuantity(updateDto: BasketProductQuantityUpdateDto): Observable<ResponseDto> {
        return super.post('UpdateQuantity', updateDto);
    }

    updateOption(updateDto: BasketProductOptionUpdateDto): Observable<ResponseDto> {
        return super.post('UpdateOption', updateDto);
    }

    updateIncludeExclude(updateDto: BasketProductIncludeExcludeUpdateDto): Observable<ResponseDto> {
        return super.post('UpdateIncludeExclude', updateDto);
    }

    showModalAddToBasket(basketAddBo: ModalBasketAddBo): void {
        if (basketAddBo.IsFastSale && !this.authService.handleRealLoginRequired()) return;

        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({ 'BasketAddComp': { 'basketAddBo': basketAddBo } }));
    }
}