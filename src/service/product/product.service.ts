import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';
import { ProductStarDto } from '../../dto/product/star.dto';
import { ProductUpdateDto } from '../../dto/product/update.dto';
import { ProductUpdateCheckDto } from '../../dto/product/update-check.dto';
import { ProductOfferBo } from '../../bo/product/offer.bo';
import { UtilService } from '../sys/util.service';
import { ProductSaveDto } from '../../dto/product/save.dto';
import { ProductTypes } from '../../enum/product/types.enum';
import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { ModalProductNewBo } from '../../bo/modal/product-new.bo';

@Injectable()
export class ProductService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('Product');
    }

    save(saveDto: ProductSaveDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    saveStar(saveDto: ProductStarDto): Observable<ResponseDto> {
        return super.post('SaveStar', saveDto);
    }

    update(updateDto: ProductUpdateDto): Observable<ResponseDto> {
        return super.post('Update', updateDto);
    }
    updateCheck(updateCheckDto: ProductUpdateCheckDto): Observable<ResponseDto> {
        return super.post('UpdateCheck', updateCheckDto);
    }

    getNextId(): Observable<ResponseDto> {
        return super.post('GetNextId', null);
    }

    showModalNew(productNewBo: ModalProductNewBo): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({
            'ProductNewComp':
                { 'productNewBo': productNewBo }
        }));
    }

    getCode(code: string): ProductOfferBo {
        const offerBo = new ProductOfferBo();

        let quantity: number = 1;
        if (this.utils.isNotNull(code) && code.includes("x")) {
            quantity = Number(code.substring(0, code.indexOf('x')));
            code = code.substring(code.indexOf('x') + 1);
        }

        offerBo.ProductId = null;
        offerBo.Code = code;
        offerBo.Quantity = quantity <= 0 ? 1 : quantity;

        return offerBo;
    }

    getStockCode(productId: number, productTypeId: ProductTypes): string {
        let result: string = '';
        switch (productTypeId) {
            case ProductTypes.xShopping:
                result = 'P';
                break;
            case ProductTypes.xService:
                result = 'S';
                break;
            case ProductTypes.xFoodBeverage:
                result = 'F';
                break;
        }

        result += productId.toString();

        return result;
    }

    getProductProfileUrl(shopUrlName, productId: number, productTypeId: ProductTypes): string {
        let result: string = '/' + shopUrlName + '/' + this.getStockCode(productId, productTypeId);

        return result;
    }
}