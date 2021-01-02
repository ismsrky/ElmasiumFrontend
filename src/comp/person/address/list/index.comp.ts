import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { PersonAddressListCriteriaComp } from './criteria/criteria.comp';
import { PersonAddressCrudComp } from '../crud/crud.comp';

// Service
import { PersonAddressService } from '../../../../service/person/address.service';
import { PersonRelationService } from '../../../../service/person/relation.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonAddressGetListCriteriaDto } from '../../../../dto/person/address/getlist-criteria.dto';
import { PersonAddressListDto } from '../../../../dto/person/address/address-list.dto';
import { PersonAddressDeleteDto } from '../../../../dto/person/address/delete.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';
import { RelationTypes } from '../../../../enum/person/relation-types.enum';
import { AddressTypes } from '../../../../enum/person/address-types.enum';
import { Stats } from '../../../../enum/sys/stats.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-address-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonAddressListIndexComp implements OnInit, OnDestroy {
    addressList: PersonAddressListDto[];
    criteriaDto: PersonAddressGetListCriteriaDto;

    selectAddressType: AddressTypes = null;
    selectAddressText: string = '';

    selectedAddress: PersonAddressListDto = null;

    newPersonAddressListDto: PersonAddressListDto;

    @ViewChild('updatePersonAddress', { static: false }) updatePersonAddress: PersonAddressCrudComp;
    @ViewChild('newPersonAddress', { static: false }) newPersonAddress: PersonAddressCrudComp;

    @ViewChild(PersonAddressListCriteriaComp, { static: false }) childCriteria: PersonAddressListCriteriaComp;

    subsNeedRefresh: Subscription;
    subsSaved: Subscription;
    subsDeleted: Subscription;

    addressTypes = AddressTypes;

    @Input('isInside') isInside: boolean = false;

    busy: boolean = false;

    constructor(
        private compBroadCastService: CompBroadCastService,
        private personAddressService: PersonAddressService,
        private personRelationService: PersonRelationService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {

        this.newPersonAddressListDto = new PersonAddressListDto();
        this.addressList = [];

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonAddressListCriteria')) {
                        if (!this.isInside) {
                            this.criteriaDto = JSON.parse(x).PersonAddressListCriteria;
                            this.loadData();
                        }
                    }
                }
            }
        );

        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonAddressCrudComp')) {
                        const addressId: number = JSON.parse(x).PersonAddressCrudComp.addressId;

                        this.loadData();
                    }
                }
            });
        this.subsDeleted = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Deleted).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonAddressCrudComp')) {
                        const addressId: number = JSON.parse(x).PersonAddressCrudComp.addressId;

                        this.loadData();
                    }
                }
            });
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subsSaved);
        this.utils.unsubs(this.subsDeleted);
    }

    showByType(selectAddressType: AddressTypes): void {
        this.selectAddressType = selectAddressType;
        this.selectAddressText = this.selectAddressType == AddressTypes.xDelivery ? 'xDeliveryAddress' : this.selectAddressType == AddressTypes.xFiche ? 'xInvoiceReceiptAddress' : 'xAddress';
        this.criteriaDto = new PersonAddressGetListCriteriaDto();
        this.criteriaDto.OwnerPersonId = this.localStorageService.personProfile.PersonId;
        this.criteriaDto.AddressTypeIdList = [];
        this.criteriaDto.StatId = Stats.xActive;
        this.show(this.criteriaDto);
    }

    show(criteriaDto: PersonAddressGetListCriteriaDto): void {
        this.isInside = true;

        this.criteriaDto = criteriaDto;

        this.loadData();
    }

    loadData(): void {
        this.busy = true;

        let subs = this.personAddressService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.addressList = x.Dto;
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

    openModal(id: number): void {
        if (!this.personRelationService.hasRelationIn(RelationTypes.xMyself, RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
            return;
        }

        const addressDto: PersonAddressListDto = this.addressList.find(f => f.Id == id);

        if (this.utils.isNotNull(addressDto) && !addressDto.IsCrudOpen) {
            addressDto.IsCrudOpen = true;

            // we need to close others.
            this.addressList.forEach(element => {
                if (element.Id != addressDto.Id)
                    element.IsCrudOpen = false;
            });

            setTimeout(() => {
                this.updatePersonAddress.showModal(id, this.criteriaDto.OwnerPersonId);
            });
        } else if (!addressDto && !this.newPersonAddressListDto.IsCrudOpen) {
            this.newPersonAddressListDto.IsCrudOpen = true;
            setTimeout(() => {
                this.newPersonAddress.showModal(0, this.criteriaDto.OwnerPersonId);
            });
        }


    }

    itemSelect(listItem: PersonAddressListDto): void {
        this.selectedAddress = null;
        if (this.utils.isNull(this.selectAddressType)) {
            this.invalidSelect = false;
            return;
        }

        this.addressList.forEach(element => {
            element.IsSelect = listItem.Id == element.Id;

            if (element.IsSelect) {
                this.selectedAddress = element;

                this.invalidSelect = false;
            }
        });
        // listItem.IsSelect = !listItem.IsSelect;
    }

    invalidSelect: boolean = false;
    validateSelect(): boolean {
        if (this.utils.isNull(this.selectAddressType)) {
            this.invalidSelect = false;
            return true;
        }

        let result: boolean = this.utils.isNotNull(this.selectedAddress);

        this.invalidSelect = !result;
        return result;
    }

    /**
     * 
      showInside(criteriaDto: PersonAddressGetListCriteriaDto): void {
        this.childCriteria.showInside(criteriaDto);

        this.criteriaDto = criteriaDto;

        setTimeout(() => {
            this.childCriteria.search();
        });
    }
     */

    delete(listItem: PersonAddressListDto): void {
        if (!this.personRelationService.hasRelationIn(RelationTypes.xMyself, RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
            return;
        }

        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const deleteDto = new PersonAddressDeleteDto();
                deleteDto.AddressId = listItem.Id;
                let subscribeDelete = this.personAddressService.delete(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subscribeDelete);

                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.compBroadCastService.sendMessage(CompBroadCastTypes.Deleted, JSON.stringify({
                                'PersonAddressCrudComp': {
                                    'addressId': listItem.Id
                                }
                            }));
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.utils.unsubs(subscribeDelete);

                        this.toastr.error(err);
                    }
                );
            }
        });
    }
}