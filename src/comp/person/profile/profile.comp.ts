import { Component, ViewChild, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// Comp
import { CommentListIndexComp } from '../../comment/list/index.comp';
import { PersonProfileImageSelectComp } from './image-select/image-select.comp';
import { PersonSettingShopGeneralComp } from '../setting/shop/general/general.comp';
import { PersonSettingShopOrderGeneralComp } from '../setting/shop/order/general/general.comp';
import { PersonAddressCrudComp } from '../address/crud/crud.comp';
import { PersonProfileProductListIndexComp } from './product/list/index.comp';
import { ImageUploadComp } from '../../image/upload/upload.comp';
import { PageTitleComp } from '../../general/page-title/page-title.comp';

// Service
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { ShopPersonService } from '../../../service/person/shop.service';
import { CommentService } from '../../../service/comment/comment.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { ShopProfileDto } from '../../../dto/person/shop/profile.dto';
import { ShopProfileGetCriteriaDto } from '../../../dto/person/shop/profile-get-criteria.dto';
import { ShopWorkingHoursGetCriteriaDto } from '../../../dto/person/shop/working-hours-get-criteria.dto';
import { ShopWorkingHoursDto } from '../../../dto/person/shop/working-hours.dto';
import { ShopOrderAreaGetListCriteriaDto } from '../../../dto/person/shop/order-area-getlist-criteria.dto';
import { ShopOrderAreaListDto } from '../../../dto/person/shop/order-area-list.dto';
import { CommentGetListCriteriaDto } from '../../../dto/comment/getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { environment } from '../../../environments/environment';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { OrderDeliveryTimes } from '../../../enum/order/delivery-times.enum';
import { AddressBoundaries } from '../../../enum/person/address-boundaries.enum';
import { AccountTypes } from '../../../enum/person/account-type.enum';
import { OrderDeliveryTypes } from '../../../enum/order/delivery-types.enum';
import { ProductTypes } from '../../../enum/product/types.enum';
import { ImageTypes } from '../../../enum/image/types.enum';
import { expandCollapse, Stc } from '../../../stc';

@Component({
    selector: 'person-profile',
    templateUrl: './profile.comp.html',
    animations: [expandCollapse],
    styleUrls: ['./profile.comp.css']
})
export class PersonProfileComp implements OnInit, OnDestroy {
    profileDto: ShopProfileDto;

    urlName: string;

    tabIndex: number = 0;

    workingHoursDto: ShopWorkingHoursDto;
    orderAreaListDto: ShopOrderAreaListDto[];

    showWorkingHours: boolean = false;
    showOrderAreaList: boolean = false;

    blinkOrderAreaList: boolean = false;
    blinkWorkingHours: boolean = false;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;
    @ViewChild(PersonProfileImageSelectComp, { static: false }) imageSelectComp: PersonProfileImageSelectComp;

    @ViewChild(PersonSettingShopGeneralComp, { static: false }) childSettingShopGeneralComp: PersonSettingShopGeneralComp;
    @ViewChild(PersonSettingShopOrderGeneralComp, { static: false }) childSettingShopOrderGeneralComp: PersonSettingShopOrderGeneralComp;
    @ViewChild(PersonAddressCrudComp, { static: false }) childPersonAddressCrudComp: PersonAddressCrudComp;

    @ViewChild(CommentListIndexComp, { static: false }) childCommentListComp: CommentListIndexComp;
    @ViewChild(PersonProfileProductListIndexComp, { static: false }) childPersonProfileProductListIndexComp: PersonProfileProductListIndexComp;
    @ViewChild(ImageUploadComp, { static: false }) childImageUploadComp: ImageUploadComp;

    busy: boolean = false;
    busyWorkingHours: boolean = false;
    busyOrderAreaList: boolean = false;

    found: boolean = false;

    subsSaved: Subscription;
    subsDeleted: Subscription;

    isSettingShopGeneralOpen: boolean = false;
    isSettingShopOrderGeneralOpen: boolean = false;
    isSettingShopAddressOpen: boolean = false;

    isCommentListOpen: boolean = false;
    isProductListOpen: boolean = false;
    commentCaseId: number = null;

    commentCountShop: number = null; // case Id: 1
    commentCountProducts: number = null; // case Id: 3
    commentCountMines: number = null; // case Id: 2

    showMyComments: boolean = false;

    orderDeliveryTimes = OrderDeliveryTimes;
    addressBoundaries = AddressBoundaries;
    accountTypes = AccountTypes;

    environment = environment;
    orderDeliveryTypes = OrderDeliveryTypes;

    isNarrow: boolean = true;

    subsCodeModelChange: Subscription;
    searchControl = new FormControl();

    profile: PersonProfileBo;

    isMobile: boolean = Stc.isMobile;

    @ViewChild('txtCode', { static: false }) txtCode: ElementRef;
    constructor(
        private shopService: ShopPersonService,
        private commentService: CommentService,
        private dialogService: DialogService,
        private compBroadCastService: CompBroadCastService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
    }

    ngOnInit(): void {
        this.isNarrow = window.innerWidth <= 768; // md

        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (x == 'PersonSettingShopGeneralComp' || x == 'PersonSettingShopOrderAreaCrudComp'
                    || x == 'PersonSettingShopOrderWorkingHoursComp' || x == 'PersonSettingShopOrderGeneralComp') {
                    this.getProfile();
                } else if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonAddressCrudComp')) {
                        const addressId: number = JSON.parse(x).PersonAddressCrudComp.addressId;

                        this.profileDto.AddressId = addressId;

                        this.childPersonAddressCrudComp.loadData(this.profileDto.AddressId);

                        this.getProfile();
                    } else if (x.includes('ImageUploadComp')) {
                        const relatedId: number = JSON.parse(x).ImageUploadComp.relatedId;
                        const imageTypeId: ImageTypes = JSON.parse(x).ImageUploadComp.imageTypeId;

                        if (imageTypeId == ImageTypes.Profile && relatedId == this.profileDto.ShopId) {
                            this.getProfile();
                        }
                    }
                }
            });
        this.subsDeleted = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Deleted).subscribe(
            x => {
                if (x == 'PersonOrderArea' || x == 'PersonOrderAreaSub') {
                    this.getProfile();
                }
            });

        this.subsCodeModelChange = this.searchControl.valueChanges
            .pipe(
                debounceTime(Stc.typingEndTime)
            ).subscribe(newValue => {
                this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonProfileSearch': { 'newValue': newValue } }));
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsSaved);
        this.utils.unsubs(this.subsDeleted);
        this.utils.unsubs(this.subsCodeModelChange);
    }

    getProfile(): void {
        const criteriaDto = new ShopProfileGetCriteriaDto();
        criteriaDto.UrlName = this.urlName;
        this.busy = true;
        let subs = this.shopService.getProfile(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.profileDto = x.Dto;

                    this.showMyComments = this.profile.PersonId == x.Dto.ShopId;

                    this.childPageTitle.title = x.Dto.ShortName + ' - ' + x.Dto.ShopTypeName;

                    this.profileDto.StarAverage = this.utils.calcAverageStar(this.profileDto.StarSum, this.profileDto.StarCount);

                    this.found = true;

                    setTimeout(() => {
                        if (this.profileDto.IsShopOwner) {
                            this.childImageUploadComp.show(this.profileDto.ShopId, ImageTypes.Profile);
                        }

                        if (!Stc.isMobile) {
                            this.txtCode.nativeElement.focus();
                        }
                    }, 200);

                    if (this.profileDto.ShopIsFoodBeverage) {
                        this.tabIndex = 2;
                        this.openProductList(ProductTypes.xFoodBeverage);
                    } else {
                        this.tabIndex = 0;
                        this.openProductList(ProductTypes.xShopping);
                    }

                    this.countCommentList(1);
                    this.countCommentList(2);
                    this.countCommentList(3);
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

    show(urlName: string): void {
        this.urlName = urlName;

        this.getProfile();
    }

    openSettingShopGeneral(): void {
        if (this.isSettingShopGeneralOpen) return;

        this.isSettingShopOrderGeneralOpen = false;
        this.isSettingShopAddressOpen = false;
        this.isSettingShopGeneralOpen = true;

        setTimeout(() => {
            this.childSettingShopGeneralComp.loadData(this.profileDto.ShopId);
        });
    }
    openSettingShopOrderGeneral(): void {
        if (this.isSettingShopOrderGeneralOpen) return;

        this.isSettingShopGeneralOpen = false;
        this.isSettingShopAddressOpen = false;
        this.isSettingShopOrderGeneralOpen = true;

        setTimeout(() => {
            this.childSettingShopOrderGeneralComp.loadData(this.profileDto.ShopId);
        });
    }
    openSettingShopAddressOpen(): void {
        if (this.isSettingShopAddressOpen) return;

        this.isSettingShopGeneralOpen = false;
        this.isSettingShopOrderGeneralOpen = false;
        this.isSettingShopAddressOpen = true;

        setTimeout(() => {
            this.childPersonAddressCrudComp.showModal(this.profileDto.AddressId, this.profileDto.ShopId);
        });
    }

    openCommentList(caseId: number): void {
        if (caseId == 2 && !this.showMyComments) return;

        this.commentCaseId = caseId;

        if (this.utils.isNull(this.commentCaseId)) return;

        this.isCommentListOpen = true;
        this.isProductListOpen = false;

        setTimeout(() => {
            if (this.commentCaseId == 1) { // comments about the shop.
                this.tabIndex = 3;
                this.childCommentListComp.showCase1(this.profileDto.ShopId);
            } else if (this.commentCaseId == 3) {
                this.tabIndex = 4;
                this.childCommentListComp.showCase3(this.profileDto.ShopId);
            } else if (this.commentCaseId == 2) {
                this.tabIndex = 5;
                this.childCommentListComp.showCase2();
            }
        });
    }
    countCommentList(caseId: number): void {
        if (caseId == 2 && !this.showMyComments) return;

        let criteriaDto: CommentGetListCriteriaDto = null;
        if (caseId == 1) {
            criteriaDto = this.commentService.getGetListCriteriaCase1(this.profileDto.ShopId);
        } else if (caseId == 2) {
            criteriaDto = this.commentService.getGetListCriteriaCase2();
        } else if (caseId == 3) {
            criteriaDto = this.commentService.getGetListCriteriaCase3(this.profileDto.ShopId);
        }
        let subs = this.commentService.getListCount(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    if (caseId == 1) {
                        this.commentCountShop = x.ReturnedId;
                    } else if (caseId == 2) {
                        this.commentCountMines = x.ReturnedId;
                    } else if (caseId == 3) {
                        this.commentCountProducts = x.ReturnedId;
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

    getWorkingHours(): void {
        this.showWorkingHours = !this.showWorkingHours;
        if (this.showWorkingHours) {
            this.workingHoursDto = null;
        } else {
            return;
        }

        const criteriaDto = new ShopWorkingHoursGetCriteriaDto();
        criteriaDto.PersonId = this.profileDto.ShopId;

        this.busyWorkingHours = true;
        let subs = this.shopService.getWorkingHours(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyWorkingHours = false;

                if (x.IsSuccess) {
                    this.workingHoursDto = x.Dto;
                    this.showWorkingHours = true;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getWorkingHours', subs);
                this.busyWorkingHours = false;
            }
        );
    }
    parseWorkingHours(valueStr): string {
        return this.shopService.parseWorkingHours(valueStr);
    }

    getOrderAreaList(): void {
        this.showOrderAreaList = !this.showOrderAreaList;
        if (this.showOrderAreaList) {
            this.orderAreaListDto = null;
        } else {
            return;
        }

        const criteriaDto = new ShopOrderAreaGetListCriteriaDto();
        criteriaDto.PersonId = this.profileDto.ShopId;
        this.busyOrderAreaList = true;
        let subs = this.shopService.getOrderAreaList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyOrderAreaList = false;

                if (x.IsSuccess) {
                    this.orderAreaListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getOrderAreaList', subs);
                this.busyOrderAreaList = false;
            }
        );
    }

    productTypes = ProductTypes;
    openProductList(productTypeId: ProductTypes): void {
        if (productTypeId == ProductTypes.xShopping) {
            this.tabIndex = 0;
        } else if (productTypeId == ProductTypes.xService) {
            this.tabIndex = 1;
        } else if (productTypeId == ProductTypes.xFoodBeverage) {
            this.tabIndex = 2;
        }

        this.isCommentListOpen = false;
        this.isProductListOpen = true;

        setTimeout(() => {
            this.childPersonProfileProductListIndexComp.show(this.profileDto, productTypeId);
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event?) {
        this.isNarrow = window.innerWidth <= 768;
    }
}