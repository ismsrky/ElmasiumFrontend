import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { ShopPersonService } from '../../../../../../../service/person/shop.service';
import { AddressService } from '../../../../../../../service/address/address.service';
import { DialogService } from '../../../../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../../../../../service/log/exception.service';
import { UtilService } from '../../../../../../../service/sys/util.service';

// Dto
import { ShopOrderAreaDto } from '../../../../../../../dto/person/shop/order-area.dto';
import { AddressGetCityListCriteriaDto } from '../../../../../../../dto/address/getcitylist-criteria.dto';
import { AddressGetStateListCriteriaDto } from '../../../../../../../dto/address/getstatelist-criteria.dto';
import { AddressGetLocalityListCriteriaDto } from '../../../../../../../dto/address/getlocalitylist-criteria.dto';
import { AddressGetDistrictListCriteriaDto } from '../../../../../../../dto/address/getdistrictlist-criteria.dto';
import { ShopOrderAreaSubDto } from '../../../../../../../dto/person/shop/order-area-sub.dto';

// Bo
import { AddressBo } from '../../../../../../../bo/person/address.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../../../enum/sys/comp-broadcast-types.enum';
import { environment } from '../../../../../../../environments/environment';
import { OrderDeliveryTimes } from '../../../../../../../enum/order/delivery-times.enum';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { Currencies } from '../../../../../../../enum/person/currencies.enum';
import { AddressBoundaries } from '../../../../../../../enum/person/address-boundaries.enum';
import { expandCollapseHidden, expandCollapse } from '../../../../../../../stc';

@Component({
    selector: 'person-setting-shop-order-area-crud',
    templateUrl: './crud.comp.html',
    animations: [expandCollapseHidden, expandCollapse]
})
export class PersonSettingShopOrderAreaCrudComp implements OnInit, OnDestroy {
    orderAreaDto: ShopOrderAreaDto;
    subDto: ShopOrderAreaSubDto;
    isNew: boolean = false;
    addressList: AddressBo[];

    @ViewChild('orderAreaForm', { static: false }) orderAreaForm: NgForm;
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    environment = environment;

    croppedImage: any;

    private _eventBus: Subject<string>;

    busy: boolean = false;
    busyAddress: boolean = false;

    selectedAddressId: number = null;

    orderDeliveryTimes = OrderDeliveryTimes;

    configCurrency: CurrencyMaskConfig;

    selectNote: string = '';
    captionStr: string = '';

    hasStates: boolean = false;

    levelLocality: boolean = false;
    levelDistrict: boolean = false;
    levelCity: boolean = false;
    levelState: boolean = false;
    levelCountry: boolean = false;

    constructor(
        private shopService: ShopPersonService,
        private addressService: AddressService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private dicService: DictionaryService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.configCurrency = this.utils.getCurrencyMaskOptions(Currencies.xTurkishLira);
        this.addressList = [];
        this.subDto = new ShopOrderAreaSubDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    showModal(orderAreaDto: ShopOrderAreaDto, hasStates: boolean, subId: number, captionStr: string): Observable<string> {
        this.orderAreaDto = new ShopOrderAreaDto(this.utils);
        this.isNew = this.utils.isNull(subId);
        this.orderAreaDto.copy(orderAreaDto);
        this.hasStates = hasStates;

        this.captionStr = captionStr;

        this.subDto = new ShopOrderAreaSubDto();
        if (!this.isNew) {
            this.subDto.copy(orderAreaDto.SubList.find(f => f.Id == subId));
        }

        if (this.utils.isNull(this.orderAreaDto.SubList)) {
            this.orderAreaDto.SubList = [];
        }

        this.selectedAddressId = null;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.orderAreaDto.CurrencyId);

        this.loadAddressList();

        this._eventBus = new Subject<string>();

        this.modal.onHide.subscribe(
            x => {
                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonSettingShopOrderAreaCrudComp');
            }
        );

        this.modal.show();

        return this._eventBus.asObservable();
    }

    save(): void {
        if (this.orderAreaForm.invalid) {
            return;
        }

        this.subDto.AddressCountryId = this.orderAreaDto.AddressCountryId;
        this.subDto.AddressStateId = this.orderAreaDto.AddressStateId;
        this.subDto.AddressCityId = this.orderAreaDto.AddressCityId;
        this.subDto.AddressDistrictId = this.orderAreaDto.AddressDistrictId;
        //this.subDto.AddressLocalityId = this.orderAreaDto.AddressLocalityId;

        if (this.levelLocality) {
            this.subDto.AddressLocalityId = this.selectedAddressId;
        } else if (this.levelDistrict) {
            this.subDto.AddressDistrictId = this.selectedAddressId;
        } else if (this.levelCity) {
            this.subDto.AddressCityId = this.selectedAddressId;
        } else if (this.levelState) {
            this.subDto.AddressStateId = this.selectedAddressId;
        } else if (this.levelCountry) {
            this.subDto.AddressCountryId = this.selectedAddressId;
        }

        if (this.utils.isNull(this.orderAreaDto.SubList)) {
            this.orderAreaDto.SubList = [];
        }

        const temp = new ShopOrderAreaDto(this.utils);
        temp.copy(this.orderAreaDto);
        if (this.isNew) {
            temp.SubList.push(this.subDto);
        } else {
            temp.SubList.find(x => x.Id == this.subDto.Id).copy(this.subDto);
        }

        this.busy = true;
        let subs = this.shopService.saveOrderArea(temp).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.orderAreaDto.Id = x.ReturnedId;

                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, 'PersonSettingShopOrderAreaCrudComp');

                    this.modal.hide();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;
            }
        );
    }

    loadAddressList(): void {
        if (this.orderAreaDto.AddressBoundaryId == AddressBoundaries.xDistrictwide) {
            this.busyAddress = true;
            const criteriaDto = new AddressGetLocalityListCriteriaDto();
            criteriaDto.DistrictId = this.orderAreaDto.AddressDistrictId;
            let subs = this.addressService.getLocalityList(criteriaDto).subscribe(
                x => {
                    this.utils.unsubs(subs);
                    this.busyAddress = false;

                    this.selectNote = 'xSelectLocality';
                    this.levelLocality = true;

                    if (x.IsSuccess) {
                        this.addressList = [];
                        this.selectedAddressId = this.subDto.AddressLocalityId;
                        x.Dto.forEach(element => {
                            if (!this.isNew || this.utils.isNull(this.orderAreaDto.SubList.find(f => f.AddressLocalityId == element.Id))) {
                                let address = new AddressBo();
                                address.Id = element.Id;
                                address.Name = element.Name;
                                this.addressList.push(address);
                            }
                        });
                    } else {
                        this.dialogService.showError(x.Message);
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'loadAddressList', subs);
                    this.busyAddress = false;
                }
            );
        } else if (this.orderAreaDto.AddressBoundaryId == AddressBoundaries.xCitywide) {
            this.busyAddress = true;
            const criteriaDto = new AddressGetDistrictListCriteriaDto();
            criteriaDto.CityId = this.orderAreaDto.AddressCityId;
            let subs = this.addressService.getDistrictList(criteriaDto).subscribe(
                x => {
                    this.utils.unsubs(subs);
                    this.busyAddress = false;

                    this.selectNote = 'xSelectDistrict';
                    this.levelDistrict = true;

                    if (x.IsSuccess) {
                        this.addressList = [];
                        this.selectedAddressId = this.subDto.AddressDistrictId;
                        x.Dto.forEach(element => {
                            if (!this.isNew || this.utils.isNull(this.orderAreaDto.SubList.find(f => f.AddressDistrictId == element.Id))) {
                                let address = new AddressBo();
                                address.Id = element.Id;
                                address.Name = element.Name;
                                this.addressList.push(address);
                            }
                        });
                    } else {
                        this.dialogService.showError(x.Message);
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'loadAddressList', subs);
                    this.busyAddress = false;
                }
            );
        } else if ((this.orderAreaDto.AddressBoundaryId == AddressBoundaries.xStatewide && this.hasStates)
            || (this.orderAreaDto.AddressBoundaryId == AddressBoundaries.xCountrywide && !this.hasStates)) {
            this.busyAddress = true;
            const criteriaDto = new AddressGetCityListCriteriaDto();
            criteriaDto.CountryId = this.orderAreaDto.AddressCountryId;
            criteriaDto.StateId = this.orderAreaDto.AddressStateId;
            let subs = this.addressService.getCityList(criteriaDto).subscribe(
                x => {
                    this.utils.unsubs(subs);
                    this.busyAddress = false;

                    this.selectNote = 'xSelectCity';
                    this.levelCity = true;

                    if (x.IsSuccess) {
                        this.addressList = [];
                        this.selectedAddressId = this.subDto.AddressCityId;
                        x.Dto.forEach(element => {
                            if (!this.isNew || this.utils.isNull(this.orderAreaDto.SubList.find(f => f.AddressCityId == element.Id))) {
                                let address = new AddressBo();
                                address.Id = element.Id;
                                address.Name = element.Name;
                                this.addressList.push(address);
                            }
                        });
                    } else {
                        this.dialogService.showError(x.Message);
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'loadAddressList', subs);
                    this.busyAddress = false;
                }
            );
        } else if (this.orderAreaDto.AddressBoundaryId == AddressBoundaries.xCountrywide && this.hasStates) {
            this.busyAddress = true;
            const criteriaDto = new AddressGetStateListCriteriaDto();
            criteriaDto.CountryId = this.orderAreaDto.AddressCountryId;
            let subs = this.addressService.getStateList(criteriaDto).subscribe(
                x => {
                    this.utils.unsubs(subs);
                    this.busyAddress = false;

                    this.selectNote = 'xSelectState';
                    this.levelState = true;

                    if (x.IsSuccess) {
                        this.addressList = [];
                        this.selectedAddressId = this.subDto.AddressStateId;
                        x.Dto.forEach(element => {
                            if (!this.isNew || this.utils.isNull(this.orderAreaDto.SubList.find(f => f.AddressStateId == element.Id))) {
                                let address = new AddressBo();
                                address.Id = element.Id;
                                address.Name = element.Name;
                                this.addressList.push(address);
                            }
                        });
                    } else {
                        this.dialogService.showError(x.Message);
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'loadAddressList', subs);
                    this.busyAddress = false;
                }
            );
        } else if (this.orderAreaDto.AddressBoundaryId == AddressBoundaries.xWorldwide) {
            this.busyAddress = true;
            let subs = this.addressService.getCountryList().subscribe(
                x => {
                    this.utils.unsubs(subs);
                    this.busyAddress = false;

                    this.selectNote = 'xSelectCountry';
                    this.levelCountry = true;

                    if (x.IsSuccess) {
                        this.addressList = [];
                        this.selectedAddressId = this.subDto.AddressCountryId;
                        x.Dto.forEach(element => {
                            if (!this.isNew || this.utils.isNull(this.orderAreaDto.SubList.find(f => f.AddressCountryId == element.Id))) {
                                let address = new AddressBo();
                                address.Id = element.Id;
                                address.Name = this.dicService.getValue(element.Name);
                                this.addressList.push(address);
                            }
                        });
                    } else {
                        this.dialogService.showError(x.Message);
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'loadAddressList', subs);
                    this.busyAddress = false;
                }
            );
        }
    }
}