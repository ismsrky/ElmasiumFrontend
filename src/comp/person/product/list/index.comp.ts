import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { PersonProductActivityListIndexComp } from '../activity/list/index.comp';
import { PageTitleComp } from '../../../general/page-title/page-title.comp';

// Service
import { PersonProductService } from '../../../../service/person/product.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { ProductService } from '../../../../service/product/product.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonProductListDto } from '../../../../dto/person/product/list.dto';
import { PersonProductGetListCriteriaDto } from '../../../../dto/person/product/getlist-criteria.dto';
import { PersonProductActivityGetListCriteriaDto } from '../../../../dto/person/product/activity-getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { ApprovalStats } from '../../../../enum/approval/stats.enum';
import { Stc, expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-product-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonProductListIndexComp implements OnInit, OnDestroy {
    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;

    @ViewChild(PersonProductActivityListIndexComp, { static: false }) childActivities: PersonProductActivityListIndexComp;

    criteriaDto: PersonProductGetListCriteriaDto;
    productList: PersonProductListDto[];

    profile: PersonProfileBo;

    isProductOfferOpen: boolean = false;

    subsNeedRefresh: Subscription;

    busy: boolean = false;

    constructor(
        private personProductService: PersonProductService,
        private productService: ProductService,
        private compBroadCastService: CompBroadCastService,
        private localStorageService: LocalStorageService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;

        this.productList = [];

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                } else if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonProductListCriteria')) {
                        this.criteriaDto = JSON.parse(x).PersonProductListCriteria;
                        this.productList = [];
                        this.loadData();
                    }
                }
            }
        );
    }

    ngOnInit(): void {
        this.loadData();
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    getActivities(listItem: PersonProductListDto): void {
        listItem.IsActivitiesOpen = !listItem.IsActivitiesOpen;

        if (listItem.IsActivitiesOpen) {
            this.productList.forEach(element => {
                if (element.Id != listItem.Id)
                    element.IsActivitiesOpen = false;
            });
        } else {
            return;
        }

        setTimeout(() => {
            const criteriaDto = new PersonProductActivityGetListCriteriaDto();
            criteriaDto.OwnerPersonId = this.criteriaDto.PersonId;

            criteriaDto.ProductIdList = [];
            criteriaDto.ProductIdList.push(listItem.ProductId);

            criteriaDto.ApprovalStatIdList = [];
            criteriaDto.ApprovalStatIdList.push(ApprovalStats.xAccepted);
            criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPending);
            criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPulledBack);
            criteriaDto.ApprovalStatIdList.push(ApprovalStats.xRejected);

            this.childActivities.showInside(criteriaDto, listItem.ProductName);
        });
    }

    loadData(): void {
        if (this.utils.isNull(this.criteriaDto) || this.waitTill) return;
        this.waitTill = true;

        this.busy = true;
        this.criteriaDto.PageOffSet = this.productList.length;
        this.compBroadCastService.sendMessage(CompBroadCastTypes.GoogleAnalytics);
        let subs = this.personProductService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                this.waitTill = false;

                if (x.IsSuccess) {
                    if (x.Dto && x.Dto.length > 0) {
                        let found: PersonProductListDto = null;
                        x.Dto.forEach(element => {
                            found = this.productList.find(f => f.Id == element.Id);
                            if (this.utils.isNull(found)) {
                                element.ProductProfileUrl = this.productService.getProductProfileUrl(this.profile.UrlName, element.ProductId, element.ProductTypeId);
                                this.productList.push(element);
                            }
                        });
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.waitTill = false;
                
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    removeItem(id: number): void {
        const ind: number = this.productList.findIndex(x => x.Id == id);
        this.productList.splice(ind, 1);
    }

    waitTill: boolean = false;
    waitRepeat: boolean = false;
    @HostListener('window:scroll', ['$event'])
    onScroll($event: Event): void {
        if ((window.innerHeight + window.scrollY + 1) >= document.scrollingElement.scrollHeight) {
            if (!this.waitRepeat) {
                this.waitRepeat = true;

                setTimeout(() => {
                    this.waitRepeat = false;
                }, Stc.waitRepeatTimeout);

                this.loadData();
            }
        }
    }

    showProductOffer(): void {
        this.isProductOfferOpen = !this.isProductOfferOpen;

        if (!this.isProductOfferOpen) return;
    }
}