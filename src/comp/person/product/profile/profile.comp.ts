import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { CommentListIndexComp } from '../../../comment/list/index.comp';
import { ProductCategoryBreadcrumbComp } from '../../../product/category/breadcrumb/breadcrumb.comp';
import { PropertyListComp } from '../../../property/list/list.comp';
import { PageTitleComp } from '../../../general/page-title/page-title.comp';
import { ProductOfferComp } from '../../../product/offer/offer.comp';
import { PersonProductSettingComp } from '../setting/setting.comp';
import { ImageUploadComp } from '../../../image/upload/upload.comp';

// Service
import { PersonProductService } from '../../../../service/person/product.service';
import { ProductCategoryService } from '../../../../service/product/category.service';
import { CommentService } from '../../../../service/comment/comment.service';
import { AppRouterService } from '../../../../service/sys/router.service';
import { BasketProductService } from '../../../../service/basket/product.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonProductProfileGetCriteriaDto } from '../../../../dto/person/product/profile-get-criteria.dto';
import { PersonProductProfileDto } from '../../../../dto/person/product/profile.dto';
import { CommentGetListCriteriaDto } from '../../../../dto/comment/getlist-criteria.dto';
import { ProductCategoryListDto } from '../../../../dto/product/category/list.dto';

// Bo
import { ModalBasketAddBo } from '../../../../bo/modal/basket-add.bo';
import { PageTitleInfoBo } from '../../../../bo/general/page-title-info.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { environment } from '../../../../environments/environment';
import { ProductCodeTypes } from '../../../../enum/product/code-types.enum';
import { ImageTypes } from '../../../../enum/image/types.enum';
import { AppRoutes } from '../../../../enum/sys/routes.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-product-profile',
    templateUrl: './profile.comp.html',
    animations: [expandCollapse]
})
export class PersonProductProfileComp implements OnInit, OnDestroy {
    profileDto: PersonProductProfileDto;

    shopUrlName: string = null;
    productCode: string = null;

    selectedCategory: ProductCategoryListDto = null;

    tabPageIndex: number = -1;

    commentCaseId: number = null;

    commentCountProducts: number = 0;
    commentCountShop: number = 0;

    @ViewChild(ProductCategoryBreadcrumbComp, { static: false }) childProductCategoryBreadcrumbComp: ProductCategoryBreadcrumbComp;
    @ViewChild(CommentListIndexComp, { static: false }) childCommentListComp: CommentListIndexComp;
    @ViewChild(PropertyListComp, { static: false }) childPropertyListComp: PropertyListComp;
    @ViewChild(PageTitleComp, { static: false }) childPageTitleComp: PageTitleComp;

    @ViewChild(ProductOfferComp, { static: false }) childProductOfferComp: ProductOfferComp;
    @ViewChild(PersonProductSettingComp, { static: false }) childPersonProductSettingComp: PersonProductSettingComp;
    @ViewChild(ImageUploadComp, { static: false }) childImageUploadComp: ImageUploadComp;

    subsNeedRefresh: Subscription;
    subsSaved: Subscription;
    subscriptionDelete: Subscription;

    found: boolean = false;

    pageTitleInfoBo: PageTitleInfoBo;

    environment = environment;
    productCodeTypes = ProductCodeTypes;

    busy: boolean = false;
    busyPropertyList: boolean = false;
    constructor(
        private personProductService: PersonProductService,
        private productCategoryService: ProductCategoryService,
        private commentService: CommentService,
        private basketProductService: BasketProductService,
        private appRouterService: AppRouterService,
        private dialogService: DialogService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profileDto = new PersonProductProfileDto();
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('selectedCategoryChanged')) {
                        const data = JSON.parse(x).selectedCategoryChanged;

                        this.selectedCategory = data.selectedCategory;

                        this.tabChanged(0);
                    }
                }
            }
        );
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonProductSettingGeneralComp')) {
                        const personProductId: number = JSON.parse(x).PersonProductSettingGeneralComp.personProductId;

                        if (personProductId == this.profileDto.PersonProductId) {
                            this.getProfile();
                        }
                    } else if (x.includes('ImageUploadComp')) {
                        const relatedId: number = JSON.parse(x).ImageUploadComp.relatedId;
                        const imageTypeId: ImageTypes = JSON.parse(x).ImageUploadComp.imageTypeId;

                        if (imageTypeId == ImageTypes.PersonProduct && relatedId == this.profileDto.PersonProductId) {
                            this.getProfile();
                        }
                    }
                }
            });
        this.subscriptionDelete = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Deleted).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonProductSettingGeneralComp')) {
                        const personProductId: number = JSON.parse(x).PersonProductSettingGeneralComp.personProductId;
                        this.appRouterService.navigate(AppRoutes.homepage);
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subsSaved);
        this.utils.unsubs(this.subscriptionDelete);
    }

    show(shopUrlName: string, productCode: string): void {
        this.shopUrlName = shopUrlName;
        this.productCode = productCode;

        this.getProfile();
    }

    getProfile(): void {
        this.busy = true;
        const criteriaDto = new PersonProductProfileGetCriteriaDto();
        criteriaDto.PersonUrlName = this.shopUrlName;
        criteriaDto.ProductCode = this.productCode;
        let subs = this.personProductService.getProfile(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.profileDto = x.Dto;

                    this.profileDto.StarAverage = this.utils.calcAverageStar(this.profileDto.StarSum, this.profileDto.StarCount);
                    this.profileDto.ShopStarAverage = this.utils.calcAverageStar(this.profileDto.ShopStarSum, this.profileDto.ShopStarCount);

                    this.pageTitleInfoBo = this.productCategoryService.getPageTitleInfoByProductType(this.profileDto.ProductTypeId);
                    this.childPageTitleComp.setInfoBo(this.pageTitleInfoBo);

                    this.found = true;

                    setTimeout(() => {
                        this.childProductCategoryBreadcrumbComp.setCategoryId(x.Dto.CategoryId);

                        if (this.profileDto.IsShopOwner) {
                            this.childPersonProductSettingComp.showByDto(x.Dto);

                            this.childImageUploadComp.show(this.profileDto.PersonProductId, ImageTypes.PersonProduct);
                        }
                        
                        this.countCommentList(0);
                        this.countCommentList(1);
                    }, 200);
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getProfile', subs);
                this.busy = false;
            }
        );
    }

    openCommentList(caseId: number): void {
        this.commentCaseId = caseId;

        if (this.utils.isNull(this.commentCaseId)) return;

        setTimeout(() => {
            if (this.commentCaseId == 0) {
                this.childCommentListComp.showCase0(this.profileDto.ShopId, this.profileDto.ProductId);
            } else if (this.commentCaseId == 1) { // comments about the shop.
                this.childCommentListComp.showCase1(this.profileDto.ShopId);
            }
        });
    }
    countCommentList(caseId: number): void {
        let criteriaDto: CommentGetListCriteriaDto = null;
        if (caseId == 0) {
            criteriaDto = this.commentService.getGetListCriteriaCase0(this.profileDto.ShopId, this.profileDto.ProductId);
        } else if (caseId == 1) {
            criteriaDto = this.commentService.getGetListCriteriaCase1(this.profileDto.ShopId);
        }
        let subs = this.commentService.getListCount(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    if (caseId == 0) {
                        this.commentCountProducts = x.ReturnedId;
                    } else if (caseId == 1) {
                        this.commentCountShop = x.ReturnedId;
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'countCommentList', subs);
            }
        );
    }

    tabChanged(tabPageIndex: number): void {
        this.tabPageIndex = tabPageIndex;

        setTimeout(() => {
            if (this.tabPageIndex == 0) {
                this.childPropertyListComp.show(this.profileDto.PersonProductId, this.selectedCategory);
            } else if (this.tabPageIndex == 1) {
                this.openCommentList(0);
            } else if (this.tabPageIndex == 2) {
                this.openCommentList(1);
            }
        });
    }

    editProduct(): void {
        this.childProductCategoryBreadcrumbComp.setCategoryId(this.profileDto.CategoryId);
    }

    addToBasket(isFastSale: boolean): void {
        const basketAddBo = new ModalBasketAddBo();
        basketAddBo.ShopId = this.profileDto.ShopId;
        basketAddBo.ProductId = this.profileDto.ProductId;
        basketAddBo.PersonProductId = this.profileDto.PersonProductId;

        basketAddBo.IsFastSale = isFastSale;
        this.basketProductService.showModalAddToBasket(basketAddBo);
    }
}

/**
 * Notes:
 * Do not remove 'Buy now' button even if user not login. Just say something about that you need to login or nagivate him / her to login page.
 */