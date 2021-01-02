import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Service
import { PersonAddressService } from '../../../../service/person/address.service';
import { AddressService } from '../../../../service/address/address.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonAddressListDto } from '../../../../dto/person/address/address-list.dto';
import { PersonAddressDto } from '../../../../dto/person/address/address.dto';
import { AddressCountryDto } from '../../../../dto/address/country.dto';
import { AddressStateDto } from '../../../../dto/address/state.dto';
import { AddressCityDto } from '../../../../dto/address/city.dto';
import { AddressDistrictDto } from '../../../../dto/address/district.dto';
import { AddressGetStateListCriteriaDto } from '../../../../dto/address/getstatelist-criteria.dto';
import { PersonAddressGetCriteriaDto } from '../../../../dto/person/address/get-criteria.dto';
import { AddressGetCityListCriteriaDto } from '../../../../dto/address/getcitylist-criteria.dto';
import { AddressLocalityDto } from '../../../../dto/address/locality.dto';
import { AddressGetLocalityListCriteriaDto } from '../../../../dto/address/getlocalitylist-criteria.dto';
import { AddressGetDistrictListCriteriaDto } from '../../../../dto/address/getdistrictlist-criteria.dto';

// Enum
import { AddressTypes } from '../../../../enum/person/address-types.enum';
import { Stats } from '../../../../enum/sys/stats.enum';
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-address-crud',
    templateUrl: './crud.comp.html',
    animations: [expandCollapse]
})
export class PersonAddressCrudComp implements OnInit, OnDestroy {
    @Input('personAddressListDto') personAddressListDto: PersonAddressListDto;

    personAddressDto: PersonAddressDto;

    addressTypes = AddressTypes;
    stats = Stats;

    countryList: AddressCountryDto[];
    stateList: AddressStateDto[];
    cityList: AddressCityDto[];
    districtList: AddressDistrictDto[];
    localityList: AddressLocalityDto[];

    busy: boolean = false;
    busyCountry: boolean = false;
    busyState: boolean = false;
    busyCity: boolean = false;
    busyDistrict: boolean = false;
    busyLocality: boolean = false;

    @ViewChild('personAddressForm', { static: false }) personAddressForm: NgForm;

    @Input('showLite') showLite: boolean = false;
    @Input('IsInside') IsInside: boolean = false;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private addressService: AddressService,
        private personAddressService: PersonAddressService,
        private localStorageService: LocalStorageService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.personAddressDto = new PersonAddressDto();
    }

    showModal(personAddressId: number, personId: number): void {
        this.personAddressDto = new PersonAddressDto();
        if (personAddressId > 0) {
            this.loadData(personAddressId);
        } else { // new address
            const currentPerson = this.localStorageService.realPerson;

            this.personAddressDto.PersonId = personId;

            if (this.showLite) {
                this.personAddressDto.AddressTypeId = AddressTypes.xOffice;
                this.personAddressDto.Name = null;
            } else {
                this.personAddressDto.InvolvedPersonName = currentPerson.FullName;
            }
        }
    }

    ngOnInit(): void {
        this.getCountryList();
        this.getCityList();
    }
    ngOnDestroy(): void {
    }

    getCountryList(): void {
        this.busyCountry = true;
        let subs = this.addressService.getCountryList().subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyCountry = false;

                if (x.IsSuccess) {
                    this.countryList = x.Dto;
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

    getCityList(): void {
        const criteriaDto = new AddressGetCityListCriteriaDto();
        criteriaDto.CountryId = 0; // xTurkey
        criteriaDto.StateId = null;
        this.busyCity = true;
        let subs = this.addressService.getCityList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyCity = false;

                this.cityList = x.Dto;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getCityList', subs);
                this.busyCity = false;
            }
        );
    }

    loadData(personAddressId: number): void {
        this.busy = true;

        const criteriaDto = new PersonAddressGetCriteriaDto();
        criteriaDto.AddressId = personAddressId;
        let subs = this.personAddressService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.countryChanged(x.Dto.CountryId, true);
                    this.stateChanged(x.Dto.StateId, true);
                    this.cityChanged(x.Dto.CityId, true);
                    this.districtChanged(x.Dto.DistrictId, true);

                    this.personAddressDto = x.Dto;
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

    save(): void {
        if (this.personAddressForm.invalid) {
            return;
        }
        if (this.personAddressForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        let subscribeSave = this.personAddressService.save(this.personAddressDto).subscribe(
            x => {
                this.utils.unsubs(subscribeSave);

                if (x.IsSuccess) {
                    this.personAddressDto.Id = x.ReturnedId;

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({
                        'PersonAddressCrudComp': {
                            'addressId': x.ReturnedId
                        }
                    }));

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                    if (this.personAddressListDto)
                        this.personAddressListDto.IsCrudOpen = false;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.utils.unsubs(subscribeSave);
                this.toastr.error(err);
            }
        );
    }

    cancel(): void {
        if (this.utils.isNotNull(this.personAddressListDto))
            this.personAddressListDto.IsCrudOpen = false;
    }

    get selectedCountry(): AddressCountryDto {
        if (this.utils.isNull(this.countryList) || this.utils.isNull(this.personAddressDto.CountryId))
            return null;

        return this.countryList.find(x => x.Id == this.personAddressDto.CountryId);
    }

    countryChanged(countryId: number, isLoadData: boolean): void {
        if (this.utils.isNull(countryId) || countryId.toString() == '0: null') {
            this.stateList = null;
            this.cityList = null;
            this.districtList = null;
            this.localityList = null;

            if (isLoadData == false) {
                this.personAddressDto.StateId = null;
                this.personAddressDto.CityId = null;
                this.personAddressDto.DistrictId = null;
                this.personAddressDto.LocalityId = null;
            }
            return;
        }
        const selectedCountry = this.countryList.find(f => f.Id == countryId);

        if (selectedCountry.HasStates) {
            this.busyState = true;
            const criteriaDto = new AddressGetStateListCriteriaDto();
            criteriaDto.CountryId = selectedCountry.Id;
            let subs = this.addressService.getStateList(criteriaDto).subscribe(
                x => {
                    this.utils.unsubs(subs);
                    this.busyState = false;

                    this.stateList = x.Dto;

                    if (isLoadData == false) {
                        this.cityList = null;
                        this.districtList = null;
                        this.localityList = null;

                        this.personAddressDto.CityId = null;
                        this.personAddressDto.DistrictId = null;
                        this.personAddressDto.LocalityId = null;
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'countryChanged -> getStateList', subs);
                    this.busyState = false;
                }
            );
        } else {
            this.stateList = [];

            this.busyCity = true;
            const criteriaDto = new AddressGetCityListCriteriaDto();
            criteriaDto.CountryId = selectedCountry.Id;
            criteriaDto.StateId = null;
            let subs = this.addressService.getCityList(criteriaDto).subscribe(
                x => {
                    this.utils.unsubs(subs);
                    this.busyCity = false;

                    this.cityList = x.Dto;
                    this.personAddressDto.StateId = null;

                    if (isLoadData == false) {
                        this.districtList = null;
                        this.localityList = null;

                        this.personAddressDto.DistrictId = null;
                        this.personAddressDto.LocalityId = null;
                    }
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'countryChanged -> getCityList', subs);
                    this.busyCity = false;
                }
            );
        }
    }

    stateChanged(stateId: number, isLoadData: boolean): void {
        if (this.utils.isNull(stateId) || stateId.toString() == '0: null') {
            this.cityList = null;
            this.districtList = null;
            this.localityList = null;

            if (isLoadData == false) {
                this.personAddressDto.CityId = null;
                this.personAddressDto.DistrictId = null;
                this.personAddressDto.LocalityId = null;
            }
            return;
        }
        this.busyCity = true;
        const criteriaDto = new AddressGetCityListCriteriaDto();
        criteriaDto.CountryId = this.personAddressDto.CountryId;
        criteriaDto.StateId = stateId;
        let subs = this.addressService.getCityList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyCity = false;

                this.cityList = x.Dto;

                if (isLoadData == false) {
                    this.cityList = null;
                    this.districtList = null;
                    this.localityList = null;

                    this.personAddressDto.DistrictId = null;
                    this.personAddressDto.LocalityId = null;
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'stateChanged', subs);
                this.busyCity = false;
            }
        );
    }

    cityChanged(cityId: number, isLoadData: boolean): void {
        if (this.utils.isNull(cityId) || cityId.toString() == '0: null') {
            this.districtList = null;
            this.localityList = null;

            if (isLoadData == false) {
                this.personAddressDto.DistrictId = null;
                this.personAddressDto.LocalityId = null;
            }
            return;
        }
        this.busyDistrict = true;
        const criteriaDto = new AddressGetDistrictListCriteriaDto();
        criteriaDto.CityId = cityId;
        let subs = this.addressService.getDistrictList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyDistrict = false;

                this.districtList = x.Dto;

                if (isLoadData == false) {
                    this.personAddressDto.DistrictId = null;
                    this.personAddressDto.LocalityId = null;

                    this.localityList = null;
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'cityChanged', subs);
                this.busyDistrict = false;
            }
        );
    }

    districtChanged(districtId: number, isLoadData: boolean): void {
        if (this.utils.isNull(districtId) || districtId.toString() == '0: null') {
            this.localityList = null;

            if (isLoadData == false) {
                this.personAddressDto.LocalityId = null;
            }
            return;
        }
        this.busyLocality = true;
        const criteriaDto = new AddressGetLocalityListCriteriaDto();
        criteriaDto.DistrictId = districtId;
        let subs = this.addressService.getLocalityList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyLocality = false;

                this.localityList = x.Dto;

                if (isLoadData == false) {
                    this.personAddressDto.LocalityId = null;
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'districtChanged', subs);
                this.busyLocality = false;
            }
        );
    }
}