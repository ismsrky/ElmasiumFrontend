import { Component, OnInit, OnDestroy } from '@angular/core';

// Comp

// Service
import { PersonAddressService } from '../../../service/person/address.service';
import { AddressService } from '../../../service/address/address.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { AddressGetStateListCriteriaDto } from '../../../dto/address/getstatelist-criteria.dto';
import { AddressGetCityListCriteriaDto } from '../../../dto/address/getcitylist-criteria.dto';
import { AddressCountryDto } from '../../../dto/address/country.dto';
import { AddressStateDto } from '../../../dto/address/state.dto';
import { AddressCityDto } from '../../../dto/address/city.dto';
import { AddressDistrictDto } from '../../../dto/address/district.dto';
import { AddressLocalityDto } from '../../../dto/address/locality.dto';
import { AddressGetDistrictListCriteriaDto } from '../../../dto/address/getdistrictlist-criteria.dto';
import { AddressGetLocalityListCriteriaDto } from '../../../dto/address/getlocalitylist-criteria.dto';
import { PersonAddressGetCriteriaDto } from '../../../dto/person/address/get-criteria.dto';
import { PersonAddressDto } from '../../../dto/person/address/address.dto';

// Bo
import { AddressBreadcrumbBo } from '../../../bo/address/address-breadcrumb.bo';

// Enum
import { expandCollapse } from '../../../stc';
import { Stats } from '../../../enum/sys/stats.enum';
import { AddressTypes } from '../../../enum/person/address-types.enum';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'address-breadcrumb',
    templateUrl: './breadcrumb.comp.html',
    animations: [expandCollapse]
})
export class AddressBreadcrumbComp implements OnInit, OnDestroy {
    addressBo: AddressBreadcrumbBo;

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

    isEdit: boolean = false;

    xAllSubs: string = '';

    shaked: boolean = false;
    constructor(
        private addressService: AddressService,
        private personAddressService: PersonAddressService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private localStorageService: LocalStorageService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.init();
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.shaked = true;
        }, 3000);
    }
    ngOnDestroy(): void {
    }

    init(): void {
        this.addressBo = new AddressBreadcrumbBo();
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
                this.logExService.saveObservableEx(err, this.constructor.name, 'init', subs);
                this.busyCountry = false;
            }
        );
    }

    loadData(): void {
        const criteriaDto = new PersonAddressGetCriteriaDto();
        criteriaDto.AddressId = -1;
        this.busy = true;
        let subs = this.personAddressService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.addressBo = new AddressBreadcrumbBo();
                    this.addressBo.CountryId = x.Dto.CountryId;
                    this.addressBo.StateId = x.Dto.StateId;
                    this.addressBo.CityId = x.Dto.CityId;
                    this.addressBo.DistrictId = x.Dto.DistrictId;
                    this.addressBo.LocalityId = x.Dto.LocalityId;

                    this.countryChanged(this.addressBo.CountryId, true);
                    this.stateChanged(this.addressBo.StateId, true);
                    this.cityChanged(this.addressBo.CityId, true);
                    this.districtChanged(this.addressBo.DistrictId, true);
                    this.localityChanged(this.addressBo.LocalityId);
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

    handleAllSubsText(): void {
        if (this.utils.isNotNull(this.addressBo.LocalityId)) {
            this.xAllSubs = this.dicService.getValue('xAllNeighborhoods');
        } else if (this.utils.isNotNull(this.addressBo.DistrictId)) {
            this.xAllSubs = this.dicService.getValue('xAllLocalities');
        } else if (this.utils.isNotNull(this.addressBo.CityId)) {
            this.xAllSubs = this.dicService.getValue('xAllDistricts');
        } else if (this.utils.isNotNull(this.addressBo.StateId)) {
            this.xAllSubs = this.dicService.getValue('xAllCities');
        } else if (this.utils.isNotNull(this.addressBo.CountryId)) {
            this.xAllSubs = this.dicService.getValue('xAllCities');
        }
    }

    get selectedCountry(): AddressCountryDto {
        if (this.utils.isNull(this.countryList) || this.utils.isNull(this.addressBo.CountryId))
            return null;

        return this.countryList.find(x => x.Id == this.addressBo.CountryId);
    }

    handleNames(): void {
        if (this.utils.isNotNull(this.addressBo.CountryId) && this.utils.isNotNull(this.countryList) && this.countryList.length > 0)
            this.addressBo.CountryName = this.countryList.find(f => f.Id == this.addressBo.CountryId).Name;

        if (this.utils.isNotNull(this.addressBo.StateId) && this.utils.isNotNull(this.stateList) && this.stateList.length > 0)
            this.addressBo.StateName = this.stateList.find(f => f.Id == this.addressBo.StateId).Name;

        if (this.utils.isNotNull(this.addressBo.CityId) && this.utils.isNotNull(this.cityList) && this.cityList.length > 0)
            this.addressBo.CityName = this.cityList.find(f => f.Id == this.addressBo.CityId).Name;

        if (this.utils.isNotNull(this.addressBo.DistrictId) && this.utils.isNotNull(this.districtList) && this.districtList.length > 0)
            this.addressBo.DistrictName = this.districtList.find(f => f.Id == this.addressBo.DistrictId).Name;

        if (this.utils.isNotNull(this.addressBo.LocalityId) && this.utils.isNotNull(this.localityList) && this.localityList.length > 0)
            this.addressBo.LocalityName = this.localityList.find(f => f.Id == this.addressBo.LocalityId).Name;
    }
    countryChanged(countryId: number, isLoadData: boolean): void {
        this.handleAllSubsText();

        if (this.utils.isNull(countryId) || countryId.toString() == '0: null') {
            this.stateList = null;
            this.cityList = null;
            this.districtList = null;
            this.localityList = null;

            if (isLoadData == false) {
                this.addressBo.StateId = null;
                this.addressBo.CityId = null;
                this.addressBo.DistrictId = null;
                this.addressBo.LocalityId = null;
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

                        this.addressBo.CityId = null;
                        this.addressBo.DistrictId = null;
                        this.addressBo.LocalityId = null;
                    }

                    this.handleNames();
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'countryChanged', subs);
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
                    this.addressBo.StateId = null;

                    if (isLoadData == false) {
                        this.districtList = null;
                        this.localityList = null;

                        this.addressBo.CityId = null;
                        this.addressBo.DistrictId = null;
                        this.addressBo.LocalityId = null;
                    }

                    this.handleNames();
                },
                err => {
                    this.logExService.saveObservableEx(err, this.constructor.name, 'countryChanged', subs);
                    this.busyCity = false;
                }
            );
        }
    }

    stateChanged(stateId: number, isLoadData: boolean): void {
        this.handleAllSubsText();

        if (this.utils.isNull(stateId) || stateId.toString() == '0: null') {
            this.cityList = null;
            this.districtList = null;
            this.localityList = null;

            if (isLoadData == false) {
                this.addressBo.CityId = null;
                this.addressBo.DistrictId = null;
                this.addressBo.LocalityId = null;
            }
            return;
        }

        this.busyCity = true;
        const criteriaDto = new AddressGetCityListCriteriaDto();
        criteriaDto.CountryId = this.addressBo.CountryId;
        criteriaDto.StateId = stateId;
        let subs = this.addressService.getCityList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyCity = false;

                this.cityList = x.Dto;

                this.handleNames();

                if (isLoadData == false) {
                    this.cityList = null;
                    this.districtList = null;
                    this.localityList = null;

                    this.addressBo.DistrictId = null;
                    this.addressBo.LocalityId = null;
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'stateChanged', subs);
                this.busyCity = false;
            }
        );
    }

    cityChanged(cityId: number, isLoadData: boolean): void {
        this.handleAllSubsText();

        if (this.utils.isNull(cityId) || cityId.toString() == '0: null') {
            this.districtList = null;
            this.localityList = null;

            if (isLoadData == false) {
                this.addressBo.DistrictId = null;
                this.addressBo.LocalityId = null;
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
                    this.addressBo.DistrictId = null;
                    this.addressBo.LocalityId = null;

                    this.localityList = null;
                }

                this.handleNames();
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'cityChanged', subs);
                this.busyDistrict = false;
            }
        );
    }

    districtChanged(districtId: number, isLoadData: boolean): void {
        this.handleAllSubsText();

        if (this.utils.isNull(districtId) || districtId.toString() == '0: null') {
            this.localityList = null;

            if (isLoadData == false) {
                this.addressBo.LocalityId = null;
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
                    this.addressBo.LocalityId = null;
                }

                this.handleNames();
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'districtChanged', subs);
                this.busyLocality = false;
            }
        );
    }
    localityChanged(localityId: number): void {
        this.handleAllSubsText();

        if (this.utils.isNull(localityId) || localityId.toString() == '0: null') {
            return;
        }

        this.handleNames();
    }

    edit(): void {
        this.isEdit = true;
    }
    ok(): void {
        this.isEdit = false;

        const saveDto = new PersonAddressDto();
        saveDto.Id = -1;
        saveDto.PersonId = this.localStorageService.personProfile.PersonId;
        saveDto.StatId = Stats.xActive;
        saveDto.AddressTypeId = AddressTypes.xArea;
        saveDto.CountryId = this.addressBo.CountryId;
        saveDto.StateId = this.addressBo.StateId;
        saveDto.CityId = this.addressBo.CityId;
        saveDto.DistrictId = this.addressBo.DistrictId;
        saveDto.LocalityId = this.addressBo.LocalityId;
        this.busy = true;
        let subs = this.personAddressService.save(saveDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, 'AddressAreaSaved');
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'ok', subs);
                this.busy = false;
            }
        );
    }
    cancel(): void {
        this.isEdit = false;
        // this.setCategoryId(this.selectedCategoryId);
    }
}