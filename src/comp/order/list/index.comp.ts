import { Component, OnInit, OnDestroy, HostListener, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Comp

// Service
import { OrderService } from '../../../service/order/order.service';
import { OrderStatHistoryService } from '../../../service/order/stat-history.service';
import { ProductService } from '../../../service/product/product.service';
import { PersonAddressService } from '../../../service/person/address.service';
import { CommentService } from '../../../service/comment/comment.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { OrderGetListCriteriaDto } from '../../../dto/order/getlist-criteria.dto';
import { OrderListDto } from '../../../dto/order/list.dto';
import { OrderStatNextListDto } from '../../../dto/order/stat-next-list.dto';
import { OrderStatListDto } from '../../../dto/order/stat-list.dto';
import { OrderProductListDto } from '../../../dto/order/product/list.dto';
import { PersonAddressGetListCriteriaDto } from '../../../dto/person/address/getlist-criteria.dto';
import { OrderStatHistoryGetListCriteriaDto } from '../../../dto/order/stat-history/getlist-criteria.dto';
import { PersonNotificationSummaryDto } from '../../../dto/person/notification-summary.dto';

// Bo
import { ModalOrderStatHistorySaveBo } from '../../../bo/modal/order-stat-history-save.bo';
import { ModalCommentSaveBo } from '../../../bo/modal/comment-save.bo';
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse, Stc } from '../../../stc';
import { PersonTypes } from '../../../enum/person/person-types.enum';
import { CommentTypes } from '../../../enum/comment/types.enum';

@Component({
    selector: 'order-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class OrderListIndexComp implements OnInit, OnDestroy {
    orderList: OrderListDto[];

    statNextListDto: OrderStatNextListDto[];
    statListDto: OrderStatListDto[];

    @Input('top10') top10: boolean;

    getIncomings: boolean = true;
    getReturns: boolean = false;

    criteriaDto: OrderGetListCriteriaDto;

    notificationSummaryDto: PersonNotificationSummaryDto;

    profile: PersonProfileBo;

    subsNeedRefresh: Subscription;

    xTitle: string = '';

    isOpenTop10: boolean = false;

    busy: boolean = false;
    busyGetList: boolean = false;
    constructor(
        private orderService: OrderService,
        private statHistoryService: OrderStatHistoryService,
        private productService: ProductService,
        private personAddressService: PersonAddressService,
        private commentService: CommentService,
        private compBroadCastService: CompBroadCastService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private dialogService: DialogService,
        private route: ActivatedRoute,
        private router: Router) {
        this.criteriaDto = new OrderGetListCriteriaDto();
        this.orderList = [];

        this.notificationSummaryDto = Stc.notificationSummaryDto;

        this.profile = this.localStorageService.personProfile;

        this.statListDto = Stc.orderStatListDto;
        this.statNextListDto = Stc.orderStatNextListDto;
    }

    ngOnInit(): void {
        if (!this.top10) {
            let subscribeData = this.route.data.subscribe(
                x => {
                    this.utils.unsubs(subscribeData);

                    this.getIncomings = x.getIncomings;
                    this.getReturns = x.getReturns;

                    this.handlePageTitle();

                    this.endPointTabChange(false);
                }
            );
        }

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;

                    this.handlePageTitle();

                    this.loadData();
                } else if (x == 'PersonNotificationSummary') {
                    this.notificationSummaryDto = Stc.notificationSummaryDto;

                    if (!this.top10 || (this.isOpenTop10 && this.top10)) {
                        this.orderList = [];
                        this.loadData();
                    }
                }
            }
        );

    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    loadData(): void {
        if (this.waitTill && !Stc.isRealLogin) return;
        if (this.top10 && !this.isOpenTop10) return;

        this.waitTill = true;

        this.busy = true;
        this.busyGetList = true;

        this.criteriaDto.CaseId = this.top10 ? 1 : 0;

        this.criteriaDto.GetIncomings = this.getIncomings;
        this.criteriaDto.GetReturns = this.getReturns;

        this.criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;
        this.criteriaDto.PersonId = this.profile.PersonId;

        this.criteriaDto.PageOffSet = this.orderList.length;
        let subs = this.orderService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                this.busyGetList = false;

                this.waitTill = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let found: OrderListDto = null;
                        x.Dto.forEach(element => {
                            found = this.orderList.find(f => f.Id == element.Id);
                            if (this.utils.isNull(found)) {
                                if (this.utils.isNotNull(element.ProductList) && element.ProductList.length > 0) {
                                    element.ProductList.forEach(tProduct => {
                                        if (this.utils.isNotNull(tProduct.IncludeExcludeList) && tProduct.IncludeExcludeList.length > 0) {
                                            tProduct.IncludeList = tProduct.IncludeExcludeList.filter(f => f.IsInclude);
                                            tProduct.ExcludeList = tProduct.IncludeExcludeList.filter(f => f.IsInclude == false);
                                        }
                                    });
                                }

                                this.handleComment(element);

                                this.orderList.push(element);

                                //this.getAddress(element);
                                //this.getHistoryList(element);
                                this.handleStatNext(element);
                            }
                        });
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.busyGetList = false;
                this.waitTill = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    openTop10(): void {
        this.isOpenTop10 = !this.isOpenTop10;

        if (this.isOpenTop10) {
            this.loadData();
        }
    }

    getProductProfileUrl(listItem: OrderListDto, productDto: OrderProductListDto): string {
        let fullUrl: string = this.productService.getProductProfileUrl(listItem.ShopUrlName, productDto.ProductId, productDto.ProductTypeId);
        return fullUrl;
    }
    goToProductProfile(listItem: OrderListDto, productDto: OrderProductListDto): void {
        this.router.navigateByUrl(this.getProductProfileUrl(listItem, productDto));
    }

    removeItem(id: number): void {
        const ind: number = this.orderList.findIndex(x => x.Id == id);
        this.orderList.splice(ind, 1);
    }

    getEndPoints: boolean = false;
    statList: OrderStatListDto[] = [];
    handleOrderStats(): void {
        let i: number = 0;

        this.statList = [];
        Stc.orderStatListDto.forEach(element => {
            i++;

            if (element.IsEndPoint == this.getEndPoints) {
                let newItem = new OrderStatListDto();
                newItem.copy(element);

                newItem.Checked = true;
                this.statList.push(newItem);
            }

            if (Stc.orderStatListDto.length == i) {
                this.criteriaStatChange();
            }
        });
        /**
         * let i: number = 0;
        const nextList = this.statNextListDto.filter(f => f.ForReturn == this.getReturns && f.ForDebt == !this.getIncomings);

        this.statList = [];

        nextList.forEach(element => {
            i++;

            let statDto = Stc.orderStatListDto.find(f => f.Id == element.OrderStatId && f.IsEndPoint == this.getEndPoints);

            if (this.utils.isNotNull(statDto) && this.utils.isNull(this.statList.find(s => s.Id == statDto.Id))) {
                statDto.Checked = true;
                this.statList.push(statDto);
            }

            if (nextList.length == i) {
                this.criteriaStatChange();
            }
        });
         */
    }

    handleStatNext(order: OrderListDto): void {
        if (this.utils.isNull(order)) return;

        let isDebt: boolean = order.DebtPersonId == this.profile.PersonId;

        order.OrderStat = Stc.orderStatListDto.find(f => f.Id == order.OrderStatId);
        order.StatNextList = this.statNextListDto.filter(f => f.ForDebt == isDebt && f.ForReturn == this.criteriaDto.GetReturns && f.OrderStatId == order.OrderStatId);

        let i: number = 0;
        order.StatNextList.forEach(element => {
            i++;
            element.NextOrderStat = this.statListDto.find(t => t.Id == element.NextOrderStatId);

            if (order.StatNextList.length == i) {
                order.StatNextList = order.StatNextList.sort((one, two) => (one.NextOrderStat.Order > two.NextOrderStat.Order ? -1 : 1));
            }
        });
    }

    endPointTabChange(getEndPoints: boolean): void {
        this.getEndPoints = getEndPoints;

        this.handleOrderStats();
    }
    criteriaStatChange(): void {
        this.orderList = [];
        this.criteriaDto.OrderStatList = [];
        if (this.utils.isNotNull(this.statList) && this.statList.length > 0) {
            let i: number = 0;
            this.statList.forEach(element => {
                i++;

                if (element.Checked && this.utils.isNull(this.criteriaDto.OrderStatList.find(s => s == element.Id))) {
                    this.criteriaDto.OrderStatList.push(element.Id);
                }

                if (this.statList.length == i) {
                    this.loadData();
                }
            });
        }
    }

    saveStatHistory(listItem: OrderListDto, orderStatDto: OrderStatListDto): void {
        const statHistorySaveBo = new ModalOrderStatHistorySaveBo();
        statHistorySaveBo.Id = null;

        statHistorySaveBo.OrderId = listItem.Id;
        statHistorySaveBo.OrderStatId = orderStatDto.Id;

        statHistorySaveBo.ShopId = listItem.ShopId;
        this.statHistoryService.showModal(statHistorySaveBo);
    }

    handlePageTitle(): void {
        if (this.profile.PersonTypeId == PersonTypes.xRealPerson) {
            if (!this.getIncomings && !this.getReturns) {
                this.xTitle = 'xMyOrders';
            } else if (!this.getIncomings && this.getReturns) {
                this.xTitle = 'xMyReturns';
            }
        } else if (this.profile.PersonTypeId == PersonTypes.xShop) {
            if (this.getIncomings && !this.getReturns) {
                this.xTitle = 'xIncomingOrders';
            } else if (!this.getIncomings && !this.getReturns) {
                this.xTitle = 'xOutgoingOrders';
            } else if (this.getIncomings && this.getReturns) {
                this.xTitle = 'xIncomingOrderReturns';
            } else if (!this.getIncomings && this.getReturns) {
                this.xTitle = 'xOutgoingOrderReturns';
            }
        }
    }

    openAddress(listItem: OrderListDto): void {
        listItem.isOpenAddress = !listItem.isOpenAddress;

        if (listItem.isOpenAddress) {
            this.getAddress(listItem);
        }
    }
    openHistory(listItem: OrderListDto): void {
        listItem.isOpenHistory = !listItem.isOpenHistory;

        if (listItem.isOpenHistory) {
            this.getHistoryList(listItem);
        }
    }

    getAddress(order: OrderListDto): void {
        if (this.utils.isNull(order) || this.utils.isNotNull(order.DeliveryAddressDto)) return;

        let criteriaDto = new PersonAddressGetListCriteriaDto();
        criteriaDto.AddressIdList = [];
        criteriaDto.AddressIdList.push(order.DeliveryAddressId);
        let subs = this.personAddressService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess && x.Dto.length > 0) {
                    x.Dto.forEach(element => {
                        if (element.Id == order.DeliveryAddressId) {
                            order.DeliveryAddressDto = element;
                        }
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getAddress', subs);
            }
        );
    }

    getHistoryList(order: OrderListDto): void {
        if (this.utils.isNull(order)) return;

        let criteriaDto = new OrderStatHistoryGetListCriteriaDto();
        criteriaDto.OrderId = order.Id;
        let subs = this.statHistoryService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    order.StatHistoryList = x.Dto;

                    order.StatHistoryList.forEach(element => {
                        element.OrderStat = Stc.orderStatListDto.find(f => f.Id == element.OrderStatId);
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getHistoryList', subs);
            }
        );
    }

    waitTill: boolean = false;
    waitRepeat: boolean = false;
    @HostListener('window:scroll', ['$event'])
    onScroll($event: Event): void {
        if ((window.innerHeight + window.scrollY + 1) >= document.scrollingElement.scrollHeight) {
            this.more();
        }
    }
    more(): void {
        if (!this.waitRepeat) {
            this.waitRepeat = true;

            setTimeout(() => {
                this.waitRepeat = false;
            }, Stc.waitRepeatTimeout);

            this.loadData();
        }
    }

    handleComment(listItem: OrderListDto): void {
        let isAuthorSeller = this.profile.PersonId == listItem.CreditPersonId;
        listItem.xCommentCaption = this.commentService.getCommentRateCaption(CommentTypes.Person, isAuthorSeller, null);

        listItem.ProductList.forEach(element => {
            element.xCommentCaption = this.commentService.getCommentRateCaption(CommentTypes.PersonProduct, isAuthorSeller, element.ProductTypeId);
        });
    }
    openComment(listItem: OrderListDto): void {
        const commentSaveBo = new ModalCommentSaveBo();
        commentSaveBo.IsAuthorSeller = this.profile.PersonId == listItem.CreditPersonId;
        commentSaveBo.RelatedId = commentSaveBo.IsAuthorSeller ? listItem.DebtPersonId : listItem.CreditPersonId;

        commentSaveBo.CommentId = listItem.CommentId;
        commentSaveBo.OrderId = listItem.Id;
        commentSaveBo.CommentTypeId = CommentTypes.Person;
        commentSaveBo.xCaption = listItem.xCommentCaption;
        commentSaveBo.ReplyCommentId = null;
        this.commentService.showModal(commentSaveBo, null);
    }
    openCommentProduct(listItem: OrderListDto, orderProductDto: OrderProductListDto): void {
        const commentSaveBo = new ModalCommentSaveBo();
        commentSaveBo.IsAuthorSeller = false;
        commentSaveBo.RelatedId = orderProductDto.Id;

        commentSaveBo.CommentId = orderProductDto.CommentId;
        commentSaveBo.OrderId = listItem.Id;
        commentSaveBo.CommentTypeId = CommentTypes.PersonProduct;
        commentSaveBo.xCaption = orderProductDto.xCommentCaption;
        commentSaveBo.ReplyCommentId = null;
        this.commentService.showModal(commentSaveBo, orderProductDto.ProductTypeId);
    }
}