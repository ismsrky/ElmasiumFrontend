import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

// Comp
import { BasketListIndexComp } from '../../basket/list/index.comp';
import { PersonAddressListIndexComp } from '../../person/address/list/index.comp';

// Service
import { OrderService } from '../../../service/order/order.service';
import { RealPersonService } from '../../../service/person/real.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { OrderSaveDto } from '../../../dto/order/save.dto';
import { RealPersonDto } from '../../../dto/person/real/real-person.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { AddressTypes } from '../../../enum/person/address-types.enum';
import { AppRouterService } from '../../../service/sys/router.service';
import { AppRoutes } from '../../../enum/sys/routes.enum';

@Component({
    selector: 'order-create',
    templateUrl: './create.comp.html'
})
export class OrderCreateComp implements OnInit, OnDestroy {
    saveDto: OrderSaveDto;

    profile: PersonProfileBo;

    realPersonDto: RealPersonDto = null;

    @ViewChild(PersonAddressListIndexComp, { static: false }) childDeliveryAddressComp: PersonAddressListIndexComp;

    @ViewChild(BasketListIndexComp, { static: true }) childBasketListIndexComp: BasketListIndexComp;

    addressTypes = AddressTypes;

    busy: boolean = false;
    constructor(
        private orderService: OrderService,
        private realPersonService: RealPersonService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private localStorageService: LocalStorageService,
        private appRouterService: AppRouterService,
        private activatedRoute: ActivatedRoute,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
        this.saveDto = new OrderSaveDto();

        this.activatedRoute.queryParams.subscribe(params => {
            const basketId = params['basketId'];
            if (this.utils.isNull(basketId)) {
                this.toastr.warning('Geçersiz sepet numarası');

                this.appRouterService.navigate(AppRoutes.myBaskets);
            } else {
                this.show(basketId);
            }
        });
    }

    ngOnInit(): void {
        this.childBasketListIndexComp.basketId = this.saveDto.BasketId;
        this.childBasketListIndexComp.loadData();
    }
    ngOnDestroy(): void {
    }

    show(basketId: number): void {
        this.saveDto.BasketId = basketId;

        setTimeout(() => {
            this.childDeliveryAddressComp.showByType(AddressTypes.xDelivery);
        });
    }

    saveCheck(): boolean {
        let result: boolean = false;

        const deliveryAddressValid = this.childDeliveryAddressComp.validateSelect();

        result = deliveryAddressValid;

        if (!result) {
            this.toastr.warning(this.dicService.getValue('xSelectAddress'));
        }

        return result;
    }

    save(): void {
        if (!this.saveCheck()) return;

        this.saveDto.DeliveryAddressId = this.childDeliveryAddressComp.selectedAddress.Id;

        this.busy = true;

        let subscribeSave = this.orderService.save(this.saveDto).subscribe(
            x => {
                this.utils.unsubs(subscribeSave);
                this.busy = false;

                if (x.IsSuccess) {
                    //this.saveDto.Id = x.ReturnedId;

                    //this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({ 'CommentCrudComp': this.saveDto }));

                    this.appRouterService.navigate(AppRoutes.homepage);
                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.utils.unsubs(subscribeSave);
                this.busy = false;

                this.toastr.error(err);
            }
        );
    }
    cancel(): void {
    }

    saveCheckBefore(): void {
        this.busy = true;
        let subs = this.realPersonService.get().subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.realPersonDto = x.Dto;

                    if (this.utils.isNull(this.realPersonDto.Phone)) {
                        this.toastr.warning(this.dicService.getValue('xPhoneRequired'));

                        setTimeout(() => {
                            this.appRouterService.navigate(AppRoutes.myProfile);
                        }, 1000);
                    } else {
                        this.save();
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'saveCheckBefore', subs);
                this.busy = false;
            }
        );
    }
}