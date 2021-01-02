import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

// Comp
import { PersonSettingShopOrderAreaCrudComp } from '../crud/crud.comp';

// Service
import { AddressService } from '../../../../../../../service/address/address.service';
import { CompBroadCastService } from '../../../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../../../../service/log/exception.service';
import { UtilService } from '../../../../../../../service/sys/util.service';

// Dto
import { ShopOrderAreaDto } from '../../../../../../../dto/person/shop/order-area.dto';
import { AddressCountryDto } from '../../../../../../../dto/address/country.dto';
import { AddressCityDto } from '../../../../../../../dto/address/city.dto';
import { AddressGetCityListCriteriaDto } from '../../../../../../../dto/address/getcitylist-criteria.dto';
import { AddressGetStateListCriteriaDto } from '../../../../../../../dto/address/getstatelist-criteria.dto';
import { AddressStateDto } from '../../../../../../../dto/address/state.dto';
import { AddressDistrictDto } from '../../../../../../../dto/address/district.dto';
import { AddressGetDistrictListCriteriaDto } from '../../../../../../../dto/address/getdistrictlist-criteria.dto';

// Bo

// Enum
import { Currencies } from '../../../../../../../enum/person/currencies.enum';
import { CompBroadCastTypes } from '../../../../../../../enum/sys/comp-broadcast-types.enum';
import { AddressBoundaries } from '../../../../../../../enum/person/address-boundaries.enum';
import { OrderDeliveryTypes } from '../../../../../../../enum/order/delivery-types.enum';
import { expandCollapse } from '../../../../../../../stc';

@Component({
    selector: 'person-setting-shop-order-area-new',
    templateUrl: './new.comp.html',
    animations: [expandCollapse]
})
export class PersonSettingShopOrderAreaNewComp implements OnInit, OnDestroy {
    orderAreaDto: ShopOrderAreaDto;

    @ViewChild('newAreaForm', { static: false }) newAreaForm: NgForm;
    @ViewChild(PersonSettingShopOrderAreaCrudComp, { static: false }) areaCrudComp: PersonSettingShopOrderAreaCrudComp;

    countryListDto: AddressCountryDto[];
    stateListDto: AddressStateDto[];
    cityListDto: AddressCityDto[];
    districtListDto: AddressDistrictDto[];

    currencies = Currencies;
    orderDeliveryTypes = OrderDeliveryTypes;
    addressBoundaries = AddressBoundaries;

    busy: boolean = false;

    busyCountry: boolean = false;
    busyState: boolean = false;
    busyCity: boolean = false;
    busyDistrict: boolean = false;

    isAreaCrudOpen: boolean = false;

    subscriptionModalClosed: Subscription;

    addArea: string = '';

    constructor(
        private addressService: AddressService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.orderAreaDto = new ShopOrderAreaDto(this.utils);
        this.orderAreaDto.CurrencyId = this.localStorageService.personProfile.SelectedCurrencyId;
    }

    ngOnInit(): void {
        this.getCountryList();

        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'PersonSettingShopOrderAreaCrudComp') {
                    this.isAreaCrudOpen = false;
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionModalClosed);
    }

    show(shopId: number): void {
        this.orderAreaDto.PersonId = shopId;
    }

    createArea(): void {
        if (this.newAreaForm.invalid) {
            return;
        }

        //this.newAreaForm.reset();

        this.isAreaCrudOpen = true;

        setTimeout(() => {
            this.areaCrudComp.showModal(this.orderAreaDto, this.hasStates(), null, this.addArea);
        });
    }
    cancel(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonSettingShopOrderAreaNewComp');
    }

    showCountry: boolean = false;
    showState: boolean = false;
    showCity: boolean = false;
    showDistrict: boolean = false;

    addressBoundaryChange(boundaryId: AddressBoundaries): void {
        this.orderAreaDto.AddressBoundaryId = boundaryId;
        this.showCountry = false;
        this.showState = false;
        this.showCity = false;
        this.showDistrict = false;

        this.orderAreaDto.AddressCountryId = null;
        this.orderAreaDto.AddressStateId = null;
        this.orderAreaDto.AddressCityId = null;
        this.orderAreaDto.AddressDistrictId = null;

        this.newAreaForm.form.markAsUntouched();
        this.newAreaForm.form.markAsPristine();
        //this.newAreaForm.reset();

        switch (this.orderAreaDto.AddressBoundaryId) {
            case AddressBoundaries.xWorldwide:
                this.addArea = 'xAddCountry';
                break;
            case AddressBoundaries.xCountrywide:
                this.showCountry = true;

                break;
            case AddressBoundaries.xStatewide:
                this.showCountry = true;
                this.addArea = 'xAddCity';
                break;
            case AddressBoundaries.xCitywide:
                this.showCountry = true;
                this.showState = true;
                this.showCity = true;
                this.addArea = 'xAddDistrict';
                break;
            case AddressBoundaries.xDistrictwide:
                this.showCountry = true;
                this.showState = true;
                this.showCity = true;
                this.showDistrict = true;
                this.addArea = 'xAddLocality';
                break;
        }
    }

    getSelectedCountry(): AddressCountryDto {
        if (this.utils.isNull(this.countryListDto)) return null;
        return this.countryListDto.find(f => f.Id == this.orderAreaDto.AddressCountryId);
    }
    hasStates(): boolean {
        const deger = this.getSelectedCountry();
        if (this.utils.isNull(deger))
            return false;
        else
            return deger.HasStates;
    }
    countrySelected(): void {
        if (this.utils.isNotNull(this.getSelectedCountry()) && this.getSelectedCountry().HasStates) {
            this.getStateList(this.orderAreaDto.AddressCountryId);
        } else {
            this.getCityList(this.orderAreaDto.AddressCountryId, null);
        }

        if (this.orderAreaDto.AddressBoundaryId == AddressBoundaries.xCountrywide)
            this.addArea = this.hasStates() ? 'xAddState' : 'xAddCity';

        this.orderAreaDto.AddressStateId = null;
        this.orderAreaDto.AddressCityId = null;
        this.orderAreaDto.AddressDistrictId = null;
    }
    stateSelected(): void {
        this.getCityList(this.orderAreaDto.AddressCountryId, this.orderAreaDto.AddressStateId);

        this.orderAreaDto.AddressCityId = null;
        this.orderAreaDto.AddressDistrictId = null;
    }
    citySelected(): void {
        this.getDistrictList(this.orderAreaDto.AddressCityId);

        this.orderAreaDto.AddressDistrictId = null;
    }

    getCountryList(): void {
        this.busyCountry = true;
        let subs = this.addressService.getCountryList().subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyCountry = false;

                if (x.IsSuccess) {
                    this.countryListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getCountryList', subs);
                this.busyCountry = false;
            }
        );
    }
    getStateList(countryId: number): void {
        this.busyState = true;
        const criteriaDto = new AddressGetStateListCriteriaDto();
        criteriaDto.CountryId = countryId;
        let subs = this.addressService.getStateList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyState = false;

                if (x.IsSuccess) {
                    this.stateListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getStateList', subs);
                this.busyState = false;
            }
        );
    }
    getCityList(countryId: number, stateId: number): void {
        this.busyCity = true;
        const criteriaDto = new AddressGetCityListCriteriaDto();
        criteriaDto.CountryId = countryId;
        criteriaDto.StateId = stateId;
        let subs = this.addressService.getCityList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyCity = false;

                if (x.IsSuccess) {
                    this.cityListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getCityList', subs);
                this.busyCity = false;
            }
        );
    }
    getDistrictList(cityId: number): void {
        this.busyDistrict = true;
        const criteriaDto = new AddressGetDistrictListCriteriaDto();
        criteriaDto.CityId = cityId;
        let subs = this.addressService.getDistrictList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyDistrict = false;

                if (x.IsSuccess) {
                    this.districtListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getDistrictList', subs);
                this.busyDistrict = false;
            }
        );
    }
}