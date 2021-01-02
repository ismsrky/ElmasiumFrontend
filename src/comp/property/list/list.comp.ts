import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// Service
import { PropertyService } from '../../../service/property/property.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PropertyGetListCriteriaDto } from '../../../dto/property/getlist-criteria.dto';
import { PropertyListDto } from '../../../dto/property/list.dto';
import { ProductCategoryListDto } from '../../../dto/product/category/list.dto';
import { PersonProductProfileDto } from '../../../dto/person/product/profile.dto';
import { PersonProductPropertyDto } from '../../../dto/person/product/property.dto';
import { PropertyGroupListDto } from '../../../dto/property/group-list.dto';
import { PropertyGroupGetListCriteriaDto } from '../../../dto/property/group-getlist-criteria.dto';

// Enum
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'property-list',
    templateUrl: './list.comp.html',
    animations: [expandCollapse]
})
export class PropertyListComp implements OnInit, OnDestroy {
    propertyListDto: PropertyListDto[];
    selectedCategory: ProductCategoryListDto = null;

    @Input('personProductProfileDto') personProductProfileDto: PersonProductProfileDto;

    propertySaveDto: PersonProductPropertyDto;

    personProductId: number;

    groupListDto: PropertyGroupListDto[];
    selectedGroupId: number = null;
    propertyListByGroupDto: PropertyListDto[];

    @ViewChild('propertySaveForm', { static: false }) propertySaveForm: NgForm;

    busy: boolean = false;
    busyGroupList: boolean = false;
    busyPropertyList: boolean = false;

    constructor(
        private propertyService: PropertyService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.propertyListDto = [];
        this.propertyListByGroupDto = [];
        this.propertySaveDto = new PersonProductPropertyDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(personProductId: number, selectedCategory: ProductCategoryListDto): void {
        this.personProductId = personProductId;
        this.selectedCategory = selectedCategory;

        this.getList();
    }

    save(): void {
        if (this.propertySaveForm.invalid) {
            return;
        }
        if (this.propertySaveForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }

        this.busy = true;
        this.propertySaveDto.PersonProductId = this.personProductId;
        let subs = this.propertyService.savePersonProduct(this.propertySaveDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.getList();

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));

                    this.showCrudProperty = false;
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
    cancel(): void {
        this.showCrudProperty = false;
    }
    delete(propertyId: number): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.busy = true;
                const deleteDto = new PersonProductPropertyDto();
                deleteDto.PersonProductId = this.personProductId;
                deleteDto.PropertyId = propertyId;
                let subs = this.propertyService.deletePersonProduct(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                        this.busy = false;

                        if (x.IsSuccess) {
                            this.getList();

                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'delete', subs);
                        this.busy = false;
                    }
                );
            }
        });
    }

    showCrudProperty: boolean = false;
    crudProperty(): void {
        //this.showCrudProperty = true;

        this.selectedGroupId = null;
        this.propertySaveDto = new PersonProductPropertyDto();
        this.groupListDto = [];
        this.propertyListByGroupDto = [];

        this.getGroupList();
    }

    getList(): void {
        this.busy = true;

        const criteriaDto = new PropertyGetListCriteriaDto();
        criteriaDto.CaseId = 1;
        criteriaDto.PersonProductId = this.personProductId;
        let subs = this.propertyService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.propertyListDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getList', subs);
                this.busy = false;
            }
        );
    }
    getGroupList(): void {
        this.busyGroupList = true;

        const criteriaDto = new PropertyGroupGetListCriteriaDto();
        criteriaDto.ProductCategoryId = this.selectedCategory.Id;
        let subs = this.propertyService.getGroupList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyGroupList = false;

                this.groupListDto = [];
                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let i: number = 0;
                        x.Dto.forEach(element => {
                            i++;
                            if (this.utils.isNull(this.propertyListDto.find(f => f.Id == element.Id))) {
                                this.groupListDto.push(element);
                            }

                            if (i == x.Dto.length) {
                                this.showCrudProperty = this.groupListDto.length > 0;

                                if (this.groupListDto.length == 0) {
                                    this.dialogService.showError(this.dicService.getValue('xAllPropertiesSaved'));
                                }
                            }
                        });
                    } else {
                        this.dialogService.showError('Bu kategori için hiç özellik tanımlanmamış. Eğer bir özellik tanımlamak isterseniz lütfen bizimle iletişime geçiniz.');
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getGroupList', subs);
                this.busyGroupList = false;
            }
        );
    }
    propertyGroupChanged(): void {
        if (this.utils.isNull(this.selectedGroupId)) {
            this.propertySaveDto.PropertyId = null;
            this.propertyListByGroupDto = [];
            return;
        }

        this.busyPropertyList = true;
        const criteriaDto = new PropertyGetListCriteriaDto();
        criteriaDto.CaseId = 2;
        criteriaDto.ProductCategoryId = this.selectedCategory.Id;
        criteriaDto.PropertyGroupId = this.selectedGroupId;
        let subs = this.propertyService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyPropertyList = false;

                if (x.IsSuccess) {
                    this.propertyListByGroupDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'propertyGroupChanged', subs);
                this.busyPropertyList = false;
            }
        );
    }

    getQueryParams(property: PropertyListDto) {
        return { [property.UrlName]: property.PropertyList[0].UrlName };
    }
}