import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { ProductCategoryGetListCriteriaDto } from '../../dto/product/category/getlist-criteria.dto';
import { ProductCategoryListDto } from '../../dto/product/category/list.dto';
import { ProductCategoryRawListDto } from '../../dto/product/category/raw-list.dto';
import { ProductCategoryCheckUrlCriteriaDto } from '../../dto/product/category/checkurl-criteria.dto';
import { ProductCategoryCheckUrlDto } from '../../dto/product/category/check-url.dto';
import { ProductCategoryGetListAdminCriteriaDto } from '../../dto/product/category/getlist-admin-criteria.dto';
import { UtilService } from '../sys/util.service';
import { PageTitleInfoBo } from '../../bo/general/page-title-info.bo';
import { ProductTypes } from '../../enum/product/types.enum';

@Injectable()
export class ProductCategoryService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService) {

        super(http, localStorageService, utils);
        super.setControllerName('ProductCategory');
    }

    getList(criteriaDto: ProductCategoryGetListCriteriaDto): Observable<ResponseGenDto<ProductCategoryListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    getRawList(criteriaDto: ProductCategoryGetListAdminCriteriaDto): Observable<ResponseGenDto<ProductCategoryRawListDto[]>> {
        return super.post('GetRawList', criteriaDto);
    }

    save(saveDto: ProductCategoryRawListDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    delete(categoryId: number): Observable<ResponseGenDto<ProductCategoryRawListDto[]>> {
        const deleteDto = new ProductCategoryRawListDto();
        deleteDto.Id = categoryId;
        return super.post('Delete', deleteDto);
    }

    getUpperList(listItem: ProductCategoryRawListDto, list: ProductCategoryRawListDto[]): ProductCategoryRawListDto[] {
        let result: ProductCategoryRawListDto[] = [];

        let item = new ProductCategoryRawListDto();
        item.copy(listItem);

        result.push(item);

        while (item.ParentId > 0) {
            item = list.find(f => f.Id == item.ParentId);

            let found = new ProductCategoryRawListDto();
            found.copy(item);
            result.push(found);
        }

        result = result.sort((one, two) => (one.Id < two.Id ? -1 : 1));

        return result;
    }

    checkUrl(criteriaDto: ProductCategoryCheckUrlCriteriaDto): Observable<ResponseGenDto<ProductCategoryCheckUrlDto>> {
        return super.post('CheckUrl', criteriaDto);
    }

    convertFromRaw(parentId: number, listRaw: ProductCategoryRawListDto[]): ProductCategoryListDto[] {
        let result: ProductCategoryListDto[] = [];

        let item: ProductCategoryListDto;
        listRaw.forEach(element => {
            if (element.ParentId == parentId) {
                item = new ProductCategoryListDto();
                item.Id = element.Id;
                item.Name = element.Name;

                item.UrlName = element.UrlName;

                item.SubCategoryList = this.convertFromRaw(item.Id, listRaw);

                result.push(item);
            }
        });

        return result;
    }
    getPageTitleInfo(rootCategoryName): PageTitleInfoBo {
        let infoBo = new PageTitleInfoBo;

        if (this.utils.isNotNull(rootCategoryName)) {
            switch (rootCategoryName) {
                case 'shopping':
                    infoBo.HelpName = 'shopping';
                    infoBo.Icon = 'shopping-cart';
                    infoBo.Title = 'xShopping';
                    infoBo.IconColor = 'text-info';
                    break;
                case 'service':
                    infoBo.HelpName = 'service';
                    infoBo.Icon = 'hand-rock-o';
                    infoBo.Title = 'xService';
                    infoBo.IconColor = 'text-danger';
                    break;
                case 'food-beverage':
                    infoBo.HelpName = 'food-beverage';
                    infoBo.Icon = 'cutlery';
                    infoBo.Title = 'xFoodBeverage';
                    infoBo.IconColor = 'text-warning';
                    break;
            }
        }

        return infoBo;
    }
    getPageTitleInfoByProductType(productTypeId: ProductTypes): PageTitleInfoBo {
        let rootCategoryName: string = '';
        switch (productTypeId) {
            case ProductTypes.xShopping:
                rootCategoryName = 'shopping';
                break;
            case ProductTypes.xService:
                rootCategoryName = 'service';
                break;
            case ProductTypes.xFoodBeverage:
                rootCategoryName = 'food-beverage';
                break;
        }
        return this.getPageTitleInfo(rootCategoryName);
    }
    //List<ProductCategoryListDto> GetList(int parentId, bool getSubList)
    //{
    //    List<ProductCategoryListDto> list =
    //        (from x in Business.Stc.ProductCategoryList
    //         where x.ParentId == parentId
    //         select new ProductCategoryListDto
    //         {
    //             Id = x.Id,
    //             Name = x.Name,

    //             SubCategoryList = getSubList ? GetList(x.Id, getSubList) : null
    //         }).ToList();

    //    return list;
    //}
}