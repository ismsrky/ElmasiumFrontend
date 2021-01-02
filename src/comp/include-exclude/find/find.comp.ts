import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { IncludeExcludeService } from '../../../service/include-exclude/include-exclude.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { IncludeExcludeGetListCriteriaDto } from '../../../dto/include-exclude/getlist-criteria.dto';
import { IncludeExcludeDto } from '../../../dto/include-exclude/include-exclude.dto';
import { IncludeExcludeSaveDto } from '../../../dto/include-exclude/save.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { Stc, expandCollapse } from '../../../stc';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'include-exclude-find',
    templateUrl: './find.comp.html',
    animations: [expandCollapse]
})
export class IncludeExcludeFindComp implements OnInit, OnDestroy {
    ieListDto: IncludeExcludeDto[];

    selectedIeListDto: IncludeExcludeDto[] = null;

    productCategoryId: number = null;
    isInclude: boolean = false;

    criteriaDto: IncludeExcludeGetListCriteriaDto;

    saveDto: IncludeExcludeSaveDto = null;

    @ViewChild('txtName', { static: false }) txtName: ElementRef;

    nameFocused: boolean = false;

    showList: boolean = false;

    subsCodeModelChange: Subscription;
    nameControl = new FormControl();

    waitTill: boolean = false;

    subsNeedRefresh: Subscription;

    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;
    @ViewChild('newIeForm', { static: false }) newIeForm: NgForm;

    nothingFound: boolean = false;

    isMobile: boolean = Stc.isMobile;

    busy: boolean = false;
    busyNewIe: boolean = false;
    constructor(
        private ieService: IncludeExcludeService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.criteriaDto = new IncludeExcludeGetListCriteriaDto();
        this.ieListDto = [];
    }

    ngOnInit(): void {
        this.subsCodeModelChange = this.nameControl.valueChanges
            .pipe(
                debounceTime(Stc.typingEndTime)
            )
            .subscribe(newValue => {
                this.ieListDto = [];
                this.criteriaDto.Name = newValue;

                if (this.utils.isNotNull(this.criteriaDto.Name)) {
                    this.search();
                } else {
                    this.criteriaDto.Name = null;
                    this.nameControl.setValue(null);
                }

                this.checkNothingFound();
            });

        if (Stc.isMobile == false) {
            this.setFocus();
        }

        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('selectedIeListDto')) {
                        const ieListDto: IncludeExcludeDto[] = JSON.parse(x).selectedIeListDto;
                        this.selectedIeListDto = ieListDto;
                        this.handleSelectedIeList();
                    }
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsCodeModelChange);
        this.utils.unsubs(this.subsNeedRefresh);
    }

    show(productCategoryId: number, isInclude: boolean): void {
        this.productCategoryId = productCategoryId;
        this.isInclude = isInclude;
    }

    search(): void {
        if (this.waitTill || this.utils.isNull(this.criteriaDto.Name)) return;

        this.waitTill = true;

        if (this.utils.isNull(this.criteriaDto.Name)) {
            this.waitTill = false;
            this.ieListDto = [];
            return;
        }

        this.busy = true;
        this.criteriaDto.CaseId = 0;
        this.criteriaDto.IsInclude = this.isInclude;
        this.criteriaDto.ProductCategoryId = this.productCategoryId;

        this.criteriaDto.PageOffSet = this.ieListDto.length;
        let subs = this.ieService.getList(this.criteriaDto).subscribe(
            x => {
                this.waitTill = false;
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let found: IncludeExcludeDto = null;
                        let i: number = 0;
                        x.Dto.forEach(element => {
                            i++;

                            found = this.ieListDto.find(f => f.Id == element.Id);
                            if (this.utils.isNull(found)) {
                                this.ieListDto.push(element);
                            }

                            if (i == x.Dto.length) {
                                this.handleSelectedIeList();
                            }
                        });
                    } else {
                        this.handleSelectedIeList();
                    }

                    this.showList = true;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.waitTill = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'search', subs);
                this.busy = false;
            }
        );
    }

    clear(): void {
        this.criteriaDto = new IncludeExcludeGetListCriteriaDto();

        this.search();
    }

    setFocus(): void {
        this.txtName.nativeElement.focus();
    }

    add(ieDto: IncludeExcludeDto): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ItemSelected, JSON.stringify({ 'IncludeExcludeFindComp': ieDto }));
    }

    showAddNew(): void {
        this.saveDto = new IncludeExcludeSaveDto();
        this.saveDto.IncludeExcludeNameListStr = null;
        this.saveDto.IsInclude = this.isInclude;
        this.saveDto.ProductCategoryId = this.productCategoryId;
        this.saveDto.IncludeExcludeName = this.criteriaDto.Name;

        setTimeout(() => {
            let subscribeCloseModal = this.modal.onHide.subscribe(
                x => {
                    this.utils.unsubs(subscribeCloseModal);
                }
            );

            this.modal.show();
        });
    }

    saveNewIe(): void {
        if (this.newIeForm.invalid) return;

        this.busyNewIe = true;
        let subs = this.ieService.save(this.saveDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busyNewIe = false;

                if (x.IsSuccess) {
                    const ieDto = new IncludeExcludeDto();
                    ieDto.Id = x.ReturnedId;
                    ieDto.Name = this.saveDto.IncludeExcludeName;
                    this.add(ieDto);

                    this.saveDto = null;

                    this.nameControl.setValue(null);

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'saveNewIe', subs);
                this.busyNewIe = false;
            }
        );
    }

    handleSelectedIeList(): void {
        if (this.utils.isNotNull(this.ieListDto) && this.ieListDto.length > 0) {
            let i: number = 0;
            this.ieListDto.forEach(element => {
                i++;

                if (this.utils.isNull(this.selectedIeListDto) || this.selectedIeListDto.length == 0) {
                    element.IsSelected = false;
                } else {
                    element.IsSelected = this.utils.isNotNull(this.selectedIeListDto.find(f => f.Id == element.Id));
                }

                if (i == this.ieListDto.length) {
                    this.checkNothingFound();
                }
            });
        } else {
            this.checkNothingFound();
        }
    }

    checkNothingFound(): void {
        if (this.utils.isNotNull(this.criteriaDto.Name)
            && (this.ieListDto.length == 0 || this.ieListDto.filter(f => f.IsSelected).length == this.ieListDto.length)
            && !this.busy) {
            this.nothingFound = true;
        } else {
            this.nothingFound = false;
        }
    }
}