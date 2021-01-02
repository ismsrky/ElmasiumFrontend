import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';

// Comp
import { PersonProductSettingGeneralComp } from './general/general.comp';
import { OptionListComp } from '../../../option/list/list.comp';
import { IncludeExcludeListComp } from '../../../include-exclude/list/list.comp';
import { ProductCategoryBreadcrumbComp } from '../../../product/category/breadcrumb/breadcrumb.comp';

// Service
import { PersonProductService } from '../../../../service/person/product.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonProductProfileDto } from '../../../../dto/person/product/profile.dto';
import { PersonProductProfileGetCriteriaDto } from '../../../../dto/person/product/profile-get-criteria.dto';

// Bo

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-product-setting',
    templateUrl: './setting.comp.html',
    animations: [expandCollapse]
})
export class PersonProductSettingComp implements OnInit, OnDestroy {
    personProductProfileDto: PersonProductProfileDto;
    personProductId: number = null;

    isGeneralOpen: boolean = false;
    isOptionsOpen: boolean = false;
    isExcludingsOpen: boolean = false;
    isIncludingsOpen: boolean = false;

    @Input('openAtBegin') openAtBegin: boolean = false;
    @Input('isInside') isInside: boolean = false;

    @ViewChild(PersonProductSettingGeneralComp, { static: false }) childPersonProductSettingGeneralComp: PersonProductSettingGeneralComp;
    @ViewChild(OptionListComp, { static: false }) childOptionListComp: OptionListComp;
    @ViewChild(IncludeExcludeListComp, { static: false }) childIncludeExcludeListComp: IncludeExcludeListComp;
    @ViewChild(ProductCategoryBreadcrumbComp, { static: false }) childProductCategoryBreadcrumbComp: ProductCategoryBreadcrumbComp;

    subsSaved: Subscription;
    subsModalClosed: Subscription;

    found: boolean = false;

    busy: boolean = false;
    constructor(
        private personProductService: PersonProductService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
    }

    ngOnInit(): void {
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonProductSettingGeneralComp')) {
                        const personProductId: number = JSON.parse(x).PersonProductSettingGeneralComp.personProductId;

                        if (personProductId == this.personProductProfileDto.PersonProductId) {
                            this.isGeneralOpen = false;
                        }
                    } else if (x.includes('OptionListComp')) {
                        const personProductId: number = JSON.parse(x).OptionListComp.personProductId;

                        if (personProductId == this.personProductProfileDto.PersonProductId) {
                            this.isOptionsOpen = false;
                        }
                    } else if (x.includes('IncludeExcludeListComp')) {
                        const personProductId: number = JSON.parse(x).IncludeExcludeListComp.personProductId;
                        const isInclude: number = JSON.parse(x).IncludeExcludeListComp.isInclude;

                        if (personProductId == this.personProductProfileDto.PersonProductId) {
                            if (isInclude) {
                                this.isIncludingsOpen = false;
                            } else {
                                this.isExcludingsOpen = false;
                            }
                        }
                    }
                }
            });
        this.subsModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonProductSettingGeneralComp')) {
                        const personProductId: number = JSON.parse(x).PersonProductSettingGeneralComp.personProductId;

                        if (personProductId == this.personProductProfileDto.PersonProductId) {
                            this.isGeneralOpen = false;
                        }
                    } else if (x.includes('OptionListComp')) {
                        const personProductId: number = JSON.parse(x).OptionListComp.personProductId;

                        if (personProductId == this.personProductProfileDto.PersonProductId) {
                            this.isOptionsOpen = false;
                        }
                    } else if (x.includes('IncludeExcludeListComp')) {
                        const personProductId: number = JSON.parse(x).IncludeExcludeListComp.personProductId;
                        const isInclude: number = JSON.parse(x).IncludeExcludeListComp.isInclude;

                        if (personProductId == this.personProductProfileDto.PersonProductId) {
                            if (isInclude) {
                                this.isIncludingsOpen = false;
                            } else {
                                this.isExcludingsOpen = false;
                            }
                        }
                    }
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsSaved);
        this.utils.unsubs(this.subsModalClosed);
    }

    // One of following show methods can be used.
    // Prefer 'showByDto' if you have dto because of performance issue.
    showByDto(personProductProfileDto: PersonProductProfileDto): void {
        this.personProductProfileDto = personProductProfileDto;

        this.found = true;

        if (this.openAtBegin) {
            this.showGeneral();
        }
    }
    showById(personProductId: number): void {
        this.personProductId = personProductId;

        this.getPersonProductProfile();
    }

    getPersonProductProfile(): void {
        this.busy = true;
        const criteriaDto = new PersonProductProfileGetCriteriaDto();
        criteriaDto.CaseId = 1;
        criteriaDto.PersonProductId = this.personProductId;
        let subs = this.personProductService.getProfile(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.personProductProfileDto = x.Dto;

                    this.found = true;

                    if (this.openAtBegin) {
                        this.showGeneral();
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getPersonProductProfile', subs);
                this.busy = false;
            }
        );
    }

    showGeneral(): void {
        this.isGeneralOpen = !this.isGeneralOpen;

        if (!this.isGeneralOpen) return;

        this.isOptionsOpen = false;
        this.isExcludingsOpen = false;
        this.isIncludingsOpen = false;

        setTimeout(() => {
            this.childPersonProductSettingGeneralComp.loadData(this.personProductProfileDto.PersonProductId);

            this.childProductCategoryBreadcrumbComp.setCategoryId(this.personProductProfileDto.CategoryId);
            //this.childProductCategoryBreadcrumbComp.editSub();
        });
    }
    showOptions(): void {
        this.isOptionsOpen = !this.isOptionsOpen;

        if (!this.isOptionsOpen) return;

        this.isGeneralOpen = false;
        this.isExcludingsOpen = false;
        this.isIncludingsOpen = false;
        setTimeout(() => {
            this.childOptionListComp.show(this.personProductProfileDto);
        });
    }
    showIncludeExclude(isInclude: boolean): void {
        if (isInclude) {
            this.isIncludingsOpen = !this.isIncludingsOpen;

            if (!this.isIncludingsOpen) return;

            this.isExcludingsOpen = false;
        } else {
            this.isExcludingsOpen = !this.isExcludingsOpen;

            if (!this.isExcludingsOpen) return;

            this.isIncludingsOpen = false;
        }

        this.isGeneralOpen = false;
        this.isOptionsOpen = false;

        setTimeout(() => {
            this.childIncludeExcludeListComp.show(this.personProductProfileDto, isInclude);
        });
    }
}