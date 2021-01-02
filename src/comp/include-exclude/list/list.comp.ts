import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { IncludeExcludeFindComp } from '../find/find.comp';

// Service
import { IncludeExcludeService } from '../../../service/include-exclude/include-exclude.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PersonProductProfileDto } from '../../../dto/person/product/profile.dto';
import { IncludeExcludeDto } from '../../../dto/include-exclude/include-exclude.dto';
import { PersonProductIncludeExcludeDto } from '../../../dto/person/product/include-exclude.dto';
import { IncludeExcludeGetListCriteriaDto } from '../../../dto/include-exclude/getlist-criteria.dto';

// Enum
import { CurrencyMaskConfig } from 'ngx-currency/src/currency-mask.config';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../stc';
import { LogExceptionService } from '../../../service/log/exception.service';

@Component({
    selector: 'include-exclude-list',
    templateUrl: './list.comp.html',
    animations: [expandCollapse]
})
export class IncludeExcludeListComp implements OnInit, OnDestroy {
    ieListDto: IncludeExcludeDto[] = null;

    personProductProfileDto: PersonProductProfileDto = null;
    isInclude: boolean = false;

    @ViewChild(IncludeExcludeFindComp, { static: false }) childIncludeExcludeFindComp: IncludeExcludeFindComp;

    saveDto: PersonProductIncludeExcludeDto = null;

    subsItemSelected: Subscription;

    busy: boolean = false;

    configCurrency: CurrencyMaskConfig;
    constructor(
        private ieService: IncludeExcludeService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
    }

    ngOnInit(): void {
        this.subsItemSelected = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ItemSelected).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('IncludeExcludeFindComp')) {
                        const ieDto: IncludeExcludeDto = JSON.parse(x).IncludeExcludeFindComp;

                        this.add(ieDto);
                    }
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsItemSelected);
    }

    show(personProductProfileDto: PersonProductProfileDto, isInclude: boolean): void {
        this.personProductProfileDto = personProductProfileDto;
        this.isInclude = isInclude;

        this.configCurrency = this.utils.getCurrencyMaskOptions(this.personProductProfileDto.ShopDefaultCurrencyId);
        this.configCurrency.allowNegative = true;

        this.saveDto = new PersonProductIncludeExcludeDto();
        this.saveDto.IsInclude = isInclude;
        this.saveDto.PersonProductId = this.personProductProfileDto.PersonProductId;

        this.childIncludeExcludeFindComp.show(personProductProfileDto.CategoryId, isInclude);

        this.getList();
    }

    getList(): void {
        this.busy = true;

        const criteriaDto = new IncludeExcludeGetListCriteriaDto();
        criteriaDto.CaseId = 1;
        criteriaDto.IsInclude = this.isInclude;

        criteriaDto.PersonProductId = this.personProductProfileDto.PersonProductId;
        let subs = this.ieService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.ieListDto = x.Dto;

                    this.saveDto.IncludeExcludeList = [];
                    if (this.utils.isNotNull(this.ieListDto) && this.ieListDto.length > 0) {
                        let ieDto: IncludeExcludeDto = null;
                        let i: number = 0;
                        this.ieListDto.forEach(element => {
                            i++;

                            ieDto = new IncludeExcludeDto();
                            ieDto.Id = element.Id;
                            ieDto.PriceGap = element.PriceGap;
                            this.saveDto.IncludeExcludeList.push(ieDto);

                            if (i == this.ieListDto.length) {
                                this.sendNeedFresh();
                            }
                        });
                    } else {
                        this.sendNeedFresh();
                    }
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

    save(): void {
        this.busy = true;
        let subs = this.ieService.savePersonProduct(this.saveDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({
                        'IncludeExcludeListComp': {
                            'personProductId': this.personProductProfileDto.PersonProductId,
                            'isInclude': this.isInclude
                        }
                    }));

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
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
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, JSON.stringify({
            'IncludeExcludeListComp': {
                'personProductId': this.personProductProfileDto.PersonProductId,
                'isInclude': this.isInclude
            }
        }));
    }

    add(ieDto: IncludeExcludeDto): void {
        if (this.utils.isNull(this.ieListDto)) {
            this.ieListDto = [];
        }
        this.ieListDto.push(ieDto);
        this.sendNeedFresh();

        if (this.utils.isNull(this.saveDto.IncludeExcludeList)) {
            this.saveDto.IncludeExcludeList = [];
        }
        this.saveDto.IncludeExcludeList.push(ieDto);
    }
    delete(ieDto: IncludeExcludeDto): void {
        if (this.utils.isNotNull(this.ieListDto)) {
            const ind: number = this.ieListDto.findIndex(x => x.Id == ieDto.Id);
            this.ieListDto.splice(ind, 1);
            this.sendNeedFresh();
        }

        if (this.utils.isNotNull(this.saveDto.IncludeExcludeList)) {
            const ind: number = this.saveDto.IncludeExcludeList.findIndex(x => x.Id == ieDto.Id);
            this.saveDto.IncludeExcludeList.splice(ind, 1);
        }
    }

    priceGapChange(ieDto: IncludeExcludeDto): void {
        this.saveDto.IncludeExcludeList.find(f => f.Id == ieDto.Id).PriceGap = ieDto.PriceGap;
    }

    sendNeedFresh(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'selectedIeListDto': this.ieListDto }));
    }
}