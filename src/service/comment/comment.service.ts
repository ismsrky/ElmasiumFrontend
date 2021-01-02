import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResponseGenDto, ResponseDto } from '../../dto/sys/response.dto';
import { LocalStorageService } from '../sys/local-storage.service';
import { BaseService } from '../sys/base.service';

import { CommentGetListCriteriaDto } from '../../dto/comment/getlist-criteria.dto';
import { CommentListDto } from '../../dto/comment/list.dto';
import { CommentDeleteDto } from '../../dto/comment/delete.dto';
import { CommentDto } from '../../dto/comment/comment.dto';
import { CommentLikeDto } from '../../dto/comment/like.dto';
import { CommentGetCriteriaDto } from '../../dto/comment/get-criteria.dto';
import { CompBroadCastTypes } from '../../enum/sys/comp-broadcast-types.enum';
import { CompBroadCastService } from '../sys/comp-broadcast-service';
import { CommentTypes } from '../../enum/comment/types.enum';
import { CommentSortTypes } from '../../enum/comment/sort-types.enum';
import { CommentActionsDto } from '../../dto/comment/actions.dto';
import { CommentGetActionsCriteriaDto } from '../../dto/comment/getactions-criteria.dto';
import { ProductTypes } from '../../enum/product/types.enum';
import { UtilService } from '../sys/util.service';
import { ModalCommentSaveBo } from '../../bo/modal/comment-save.bo';

@Injectable()
export class CommentService extends BaseService {
    constructor(
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        private utils: UtilService,
        private compBroadCastService: CompBroadCastService) {

        super(http, localStorageService, utils);
        super.setControllerName('Comment');
    }

    get(criteriaDto: CommentGetCriteriaDto): Observable<ResponseGenDto<CommentDto>> {
        return super.post('Get', criteriaDto);
    }

    getList(criteriaDto: CommentGetListCriteriaDto): Observable<ResponseGenDto<CommentListDto[]>> {
        return super.post('GetList', criteriaDto);
    }

    getListCount(criteriaDto: CommentGetListCriteriaDto): Observable<ResponseDto> {
        return super.post('GetListCount', criteriaDto);
    }

    delete(deleteDto: CommentDeleteDto): Observable<ResponseDto> {
        return super.post('Delete', deleteDto);
    }

    save(saveDto: CommentDto): Observable<ResponseDto> {
        return super.post('Save', saveDto);
    }

    saveLike(saveDto: CommentLikeDto): Observable<ResponseDto> {
        return super.post('SaveLike', saveDto);
    }

    getActions(criteriaDto: CommentGetActionsCriteriaDto): Observable<ResponseGenDto<CommentActionsDto>> {
        return super.post('GetActions', criteriaDto);
    }

    getCommentRateCaption(commentTypeId: CommentTypes, isAuthorSeller: boolean, productTypeId: ProductTypes): string {
        if (commentTypeId == CommentTypes.Person) {
            return isAuthorSeller ? 'xRateCustomer' : 'xRateSeller';
        } else if (commentTypeId == CommentTypes.PersonProduct) {
            let xCaption = '';
            switch (productTypeId) {
                case ProductTypes.xShopping:
                    xCaption = 'xRateProduct';
                    break;
                case ProductTypes.xService:
                    xCaption = 'xRateService';
                    break;
                case ProductTypes.xFoodBeverage:
                    xCaption = 'xRateFoodBeverage';
                    break;
            }

            return xCaption;
        } else if (commentTypeId == CommentTypes.ReplyPerson || commentTypeId == CommentTypes.ReplyPersonProduct) {
            return 'xReply';
        }
    }

    showModal(commentSaveBo: ModalCommentSaveBo, productTypeId: ProductTypes): void {
        commentSaveBo.xCaption = this.getCommentRateCaption(commentSaveBo.CommentTypeId, commentSaveBo.IsAuthorSeller, productTypeId);
        this.compBroadCastService.sendMessage(CompBroadCastTypes.Open, JSON.stringify({ 'CommentCrudComp': { 'commentSaveBo': commentSaveBo } }));
    }
    showModalListItem(listItem: CommentListDto): void {
        const commentSaveBo = new ModalCommentSaveBo();
        commentSaveBo.CommentId = listItem.Id;
        commentSaveBo.OrderId = listItem.OrderId;
        commentSaveBo.CommentTypeId = listItem.CommentTypeId;
        commentSaveBo.IsAuthorSeller = listItem.IsAuthorSeller;

        if (listItem.CommentTypeId == CommentTypes.Person) {
            commentSaveBo.RelatedId = listItem.PersonId;
        } else if (listItem.CommentTypeId == CommentTypes.PersonProduct) {
            commentSaveBo.RelatedId = listItem.OrderProductId;
        }

        this.showModal(commentSaveBo, listItem.ProductTypeId);
    }
    showModalReply(listItem: CommentListDto): void {
        const commentSaveBo = new ModalCommentSaveBo();
        commentSaveBo.CommentId = null;
        commentSaveBo.OrderId = listItem.OrderId;
        commentSaveBo.CommentTypeId = listItem.CommentTypeId == CommentTypes.Person ? CommentTypes.ReplyPerson : CommentTypes.ReplyPersonProduct;
        commentSaveBo.IsAuthorSeller = listItem.IsAuthorSeller;
        commentSaveBo.ReplyCommentId = listItem.Id;

        if (listItem.CommentTypeId == CommentTypes.Person) {
            commentSaveBo.RelatedId = listItem.PersonId;
        } else if (listItem.CommentTypeId == CommentTypes.PersonProduct) {
            commentSaveBo.RelatedId = listItem.OrderProductId;
        }

        this.showModal(commentSaveBo, listItem.ProductTypeId);
    }

    getGetListCriteriaCase0(shopId: number, productId: number): CommentGetListCriteriaDto {
        const criteriaDto = new CommentGetListCriteriaDto();
        criteriaDto.CaseId = 0;
        criteriaDto.PersonId = shopId;
        criteriaDto.ProductId = productId;

        criteriaDto.CommentTypeId = null; // not important.
        criteriaDto.CommentSortTypeId = CommentSortTypes.xLatest;

        return criteriaDto;
    }
    getGetListCriteriaCase1(shopId: number): CommentGetListCriteriaDto {
        const criteriaDto = new CommentGetListCriteriaDto();
        criteriaDto.CaseId = 1;
        criteriaDto.PersonId = shopId;
        criteriaDto.ProductId = null;

        criteriaDto.CommentTypeId = null; // not important.
        criteriaDto.CommentSortTypeId = CommentSortTypes.xLatest;

        return criteriaDto;
    }
    getGetListCriteriaCase2(): CommentGetListCriteriaDto {
        const criteriaDto = new CommentGetListCriteriaDto();
        criteriaDto.CaseId = 2;
        criteriaDto.PersonId = null;
        criteriaDto.ProductId = null;

        criteriaDto.CommentTypeId = null; // not important.
        criteriaDto.CommentSortTypeId = CommentSortTypes.xLatest;

        return criteriaDto;
    }
    getGetListCriteriaCase3(shopId: number): CommentGetListCriteriaDto {
        const criteriaDto = new CommentGetListCriteriaDto();
        criteriaDto.CaseId = 3;
        criteriaDto.PersonId = shopId;
        criteriaDto.ProductId = null;

        criteriaDto.CommentTypeId = null; // not important.
        criteriaDto.CommentSortTypeId = CommentSortTypes.xLatest;

        return criteriaDto;
    }
}