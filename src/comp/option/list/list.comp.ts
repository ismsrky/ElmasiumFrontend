import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Service
import { OptionService } from '../../../service/option/option.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { OptionGetListCriteriaDto } from '../../../dto/option/getlist-criteria.dto';
import { OptionListDto } from '../../../dto/option/list.dto';
import { PersonProductProfileDto } from '../../../dto/person/product/profile.dto';
import { PersonProductOptionDto } from '../../../dto/person/product/option.dto';
import { OptionGroupListDto } from '../../../dto/option/group-list.dto';
import { OptionGroupGetListCriteriaDto } from '../../../dto/option/group-getlist-criteria.dto';
import { OptionDto } from '../../../dto/option/option.dto';

// Enum
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'option-list',
    templateUrl: './list.comp.html',
    animations: [expandCollapse]
})
export class OptionListComp implements OnInit, OnDestroy {
    optionListDto: OptionListDto[];
    selectedOption: OptionListDto = null;

    AllOptionListDto: OptionListDto[];

    personProductProfileDto: PersonProductProfileDto = null;

    optionSaveDto: PersonProductOptionDto;

    groupListDto: OptionGroupListDto[];
    selectedGroupId: number = null;

    absentGroupList: number[];

    busy: boolean = false;
    busyGroupList: boolean = false;
    busyOptionList: boolean = false;

    configCurrency: CurrencyMaskConfig;
    constructor(
        private optionService: OptionService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.optionSaveDto = new PersonProductOptionDto();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(personProductProfileDto: PersonProductProfileDto): void {
        this.personProductProfileDto = personProductProfileDto;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.personProductProfileDto.ShopDefaultCurrencyId);
        this.configCurrency.allowNegative = true;

        this.getAllOption();
    }

    save(): void {
        this.busyOptionList = true;

        const saveDto = new PersonProductOptionDto();
        saveDto.PersonProductId = this.personProductProfileDto.PersonProductId;

        let subscribeGetList = this.getCheckedOptionList().subscribe(
            x => {
                this.utils.unsubs(subscribeGetList);

                saveDto.OptionList = x;
                let subs = this.optionService.savePersonProduct(saveDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                        this.busyOptionList = false;

                        if (x.IsSuccess) {
                            this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({
                                'OptionListComp': {
                                    'personProductId': this.personProductProfileDto.PersonProductId
                                }
                            }));

                            this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                        this.busyOptionList = false;
                    }
                );
            }
        );
    }
    cancel(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, JSON.stringify({
            'OptionListComp': {
                'personProductId': this.personProductProfileDto.PersonProductId
            }
        }));
    }

    tabSelect(option: OptionListDto): void {
        this.selectedOption = option;
    }

    getAllOption(): void {
        this.busyOptionList = true;

        const criteriaDto = new OptionGetListCriteriaDto();
        criteriaDto.CaseId = 0;
        criteriaDto.ProductCategoryId = this.personProductProfileDto.CategoryId;
        let subs = this.optionService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyOptionList = false;

                if (x.IsSuccess) {
                    this.AllOptionListDto = x.Dto;

                    this.getList();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getAllOption', subs);
                this.busyOptionList = false;
            }
        );
    }

    getList(): void {
        this.busyOptionList = true;

        const criteriaDto = new OptionGetListCriteriaDto();
        criteriaDto.CaseId = 1;
        criteriaDto.PersonProductId = this.personProductProfileDto.PersonProductId;
        let subs = this.optionService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyOptionList = false;

                if (x.IsSuccess) {
                    //this.optionListDto = x.Dto;
                    this.optionListDto = [];

                    let i: number = 0;
                    let f: number = 0;
                    this.absentGroupList = [];
                    let myGroup: OptionListDto = null;
                    let myOption: OptionListDto = null;
                    this.AllOptionListDto.forEach(tGroup => {
                        i++;
                        f = 0;
                        myGroup = x.Dto.find(f => f.Id == tGroup.Id);
                        if (this.utils.isNotNull(myGroup)) {
                            tGroup.OptionList.forEach(tOption => {
                                f++;
                                myOption = myGroup.OptionList.find(f => f.Id == tOption.Id);

                                tOption.IsChecked = this.utils.isNotNull(myOption);

                                if (tOption.IsChecked) {
                                    tOption.PriceGap = myOption.PriceGap;
                                }

                                if (f == tGroup.OptionList.length) {
                                    this.optionListDto.push(tGroup);
                                }

                                if (i == this.AllOptionListDto.length && f == tGroup.OptionList.length) {
                                    if (this.optionListDto.length > 0) {
                                        this.selectedOption = this.optionListDto[0];
                                    }
                                    this.getGroupList();
                                }
                            });
                        } else {
                            this.absentGroupList.push(tGroup.Id);

                            if (i == this.AllOptionListDto.length) {
                                if (this.optionListDto.length > 0) {
                                    this.selectedOption = this.optionListDto[0];
                                }
                                this.getGroupList();
                            }
                        }
                    });
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getList', subs);
                this.busyOptionList = false;
            }
        );
    }

    getGroupList(): void {
        this.busyGroupList = true;

        const criteriaDto = new OptionGroupGetListCriteriaDto();
        criteriaDto.ProductCategoryId = this.personProductProfileDto.CategoryId;
        let subs = this.optionService.getGroupList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyGroupList = false;

                this.groupListDto = [];
                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let i: number = 0;
                        x.Dto.forEach(element => {
                            i++;

                            if (this.utils.isNotNull(this.absentGroupList.find(f => f == element.Id))) {
                                this.groupListDto.push(element);
                            }
                        });
                    } else {
                        this.dialogService.showError('Bu kategori için hiç seçenek tanımlanmamış. Eğer bir seçenek tanımlamak isterseniz lütfen bizimle iletişime geçiniz.');
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

    addToOptionList(groupListItem: OptionGroupListDto): void {
        this.busyOptionList = true;

        const newOption = new OptionListDto();
        newOption.Id = groupListItem.Id;
        newOption.Name = groupListItem.Name;
        newOption.UrlName = groupListItem.UrlName;
        newOption.OptionList = [];

        const criteriaDto = new OptionGetListCriteriaDto();
        criteriaDto.CaseId = 2;
        criteriaDto.OptionGroupId = groupListItem.Id;
        criteriaDto.ProductCategoryId = this.personProductProfileDto.CategoryId;
        let subs = this.optionService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyOptionList = false;

                if (x.IsSuccess) {
                    newOption.OptionList = x.Dto;

                    this.optionListDto.push(newOption);

                    if (this.optionListDto.length == 1) {
                        this.selectedOption = newOption;
                    }

                    const ind: number = this.groupListDto.findIndex(x => x.Id == groupListItem.Id);
                    this.groupListDto.splice(ind, 1);
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'addToOptionList', subs);
                this.busyOptionList = false;
            }
        );
    }

    deleteFromOptionList(optionListItem: OptionListDto): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const newGroup = new OptionGroupListDto();
                newGroup.Id = optionListItem.Id;
                newGroup.Name = optionListItem.Name;
                newGroup.UrlName = optionListItem.UrlName;
                this.groupListDto.push(newGroup);

                const ind: number = this.optionListDto.findIndex(x => x.Id == optionListItem.Id);
                this.optionListDto.splice(ind, 1);

                if (this.optionListDto.length == 1) {
                    this.selectedOption = this.optionListDto[0];
                } else if (this.utils.isNotNull(this.selectedOption) && this.selectedOption.Id == optionListItem.Id) {
                    this.selectedOption = null;
                }
            }
        });
    }

    getCheckedOptionList(): Observable<OptionDto[]> {
        const _eventBus = new Subject<OptionDto[]>();

        if (this.utils.isNotNull(this.optionListDto) && this.optionListDto.length > 0
            && this.utils.isNotNull(this.optionListDto[0].OptionList) && this.optionListDto[0].OptionList.length > 0) {
            let optionDto: OptionDto[] = [];

            let tOptionDto: OptionDto = null;
            let i: number = 0;
            let f: number = 0;
            this.optionListDto.forEach(tGroup => {
                i++;
                f = 0;
                tGroup.OptionList.forEach(tOption => {
                    f++;
                    if (tOption.IsChecked) {
                        tOptionDto = new OptionDto();
                        tOptionDto.OptionId = tOption.Id;
                        tOptionDto.PriceGap = tOption.PriceGap;
                        optionDto.push(tOptionDto);
                    }

                    if (i == this.optionListDto.length && f == tGroup.OptionList.length) {
                        setTimeout(() => {
                            _eventBus.next(optionDto);
                        });
                    }
                });
            });
        } else {
            setTimeout(() => {
                _eventBus.next(null);
            });
        }

        return _eventBus.asObservable();
    }
}