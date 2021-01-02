import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { PersonSettingShopOrderAreaNewComp } from '../new/new.comp';
import { PersonSettingShopOrderAreaCrudComp } from '../crud/crud.comp';

// Service
import { ShopPersonService } from '../../../../../../../service/person/shop.service';
import { CompBroadCastService } from '../../../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../../../../../service/log/exception.service';
import { UtilService } from '../../../../../../../service/sys/util.service';

// Dto
import { ShopOrderAreaGetListCriteriaDto } from '../../../../../../../dto/person/shop/order-area-getlist-criteria.dto';
import { ShopOrderAreaListDto } from '../../../../../../../dto/person/shop/order-area-list.dto';
import { ShopOrderAreaDeleteDto } from '../../../../../../../dto/person/shop/order-area-delete.dto';
import { ShopOrderAreaSubDeleteDto } from '../../../../../../../dto/person/shop/order-area-sub-delete.dto';
import { ShopOrderAreaGetCriteriaDto } from '../../../../../../../dto/person/shop/order-area-get-criteria.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../../../../enum/sys/dialog/dialog-buttons.enum';
import { expandCollapse } from '../../../../../../../stc';

@Component({
    selector: 'person-setting-shop-order-area-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonSettingShopOrderAreaListIndexComp implements OnInit, OnDestroy {
    shopId: number;
    orderAreaListDto: ShopOrderAreaListDto[];

    @ViewChild(PersonSettingShopOrderAreaCrudComp, { static: false }) areaCrudComp: PersonSettingShopOrderAreaCrudComp;
    @ViewChild(PersonSettingShopOrderAreaNewComp, { static: false }) newAreaComp: PersonSettingShopOrderAreaNewComp;

    isNewAreaOpen: boolean = false;
    isAreaCrudOpen: boolean = false;

    busy: boolean = false;

    subscriptionModalClosed: Subscription;
    subsSaved: Subscription;

    constructor(
        private shopService: ShopPersonService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.orderAreaListDto = [];
    }

    ngOnInit(): void {
        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'PersonSettingShopOrderAreaNewComp') {
                    this.isNewAreaOpen = false;
                } else if (x == 'PersonSettingShopOrderAreaCrudComp') {
                    this.isAreaCrudOpen = false;
                }
            });
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (x == 'PersonSettingShopOrderAreaCrudComp') {
                    this.isNewAreaOpen = false;

                    this.loadData(this.shopId);
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionModalClosed);
        this.utils.unsubs(this.subsSaved);
    }

    loadData(shopId: number): void {
        this.shopId = shopId;

        const criteriaDto = new ShopOrderAreaGetListCriteriaDto();
        criteriaDto.PersonId = shopId;
        let subs = this.shopService.getOrderAreaList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.orderAreaListDto = x.Dto;

                    console.log(this.orderAreaListDto);
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    newArea(): void {
        this.isNewAreaOpen = true;

        setTimeout(() => {
            this.newAreaComp.show(this.shopId);
        });
    }

    deleteArea(personOrderAreaId: number): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.busy = true;
                const deleteDto = new ShopOrderAreaDeleteDto();
                deleteDto.PersonId = this.shopId;
                deleteDto.PersonOrderAreaId = personOrderAreaId;
                let subs = this.shopService.deleteOrderArea(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.compBroadCastService.sendMessage(CompBroadCastTypes.Deleted, 'PersonOrderArea');

                            this.removeArea(personOrderAreaId);
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'deleteArea', subs);
                this.busy = false;
                    }
                );
            }
        });
    }

    removeArea(id: number): void {
        const ind: number = this.orderAreaListDto.findIndex(x => x.Id == id);
        this.orderAreaListDto.splice(ind, 1);
    }

    deleteAreaSub(personOrderAreaId: number, personOrderAreaSubId: number): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.busy = true;
                const deleteDto = new ShopOrderAreaSubDeleteDto();
                deleteDto.PersonId = this.shopId;
                deleteDto.PersonOrderAreaSubId = personOrderAreaSubId;
                let subs = this.shopService.deleteOrderAreaSub(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.removeAreaSub(personOrderAreaId, personOrderAreaSubId);

                            this.compBroadCastService.sendMessage(CompBroadCastTypes.Deleted, 'PersonOrderAreaSub');
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'deleteAreaSub', subs);
                this.busy = false;
                    }
                );
            }
        });
    }

    removeAreaSub(id: number, subId: number): void {
        const item = this.orderAreaListDto.find(x => x.Id == id);
        const ind: number = item.SubList.findIndex(f => f.Id == subId);
        item.SubList.splice(ind, 1);

        if (item.SubList.length == 0) {
            this.removeArea(item.Id);
        }
    }

    addEditArea(listItem: ShopOrderAreaListDto, subId: number, addArea: string): void {
        this.isAreaCrudOpen = true;

        const criteriaDto = new ShopOrderAreaGetCriteriaDto();
        criteriaDto.Id = listItem.Id;

        this.busy = true;
        let subs = this.shopService.getOrderArea(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                
                if (x.IsSuccess) {
                    this.areaCrudComp.showModal(x.Dto, listItem.SubList[0].HasStates, subId, addArea);
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'addEditArea', subs);
                this.busy = false;
            }
        );
    }
}