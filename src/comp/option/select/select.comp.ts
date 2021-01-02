import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// Service
import { OptionService } from '../../../service/option/option.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '.././../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { OptionGetListCriteriaDto } from '../../../dto/option/getlist-criteria.dto';
import { OptionListDto } from '../../../dto/option/list.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../stc';
import { Currencies } from '../../../enum/person/currencies.enum';

@Component({
    selector: 'option-select',
    templateUrl: './select.comp.html',
    animations: [expandCollapse]
})
export class OptionSelectComp implements OnInit, OnDestroy {
    optionListDto: OptionListDto[];

    personProductId: number;

    preSelectedOptionIdList: number[];
    selectedOptionIdList: number[];

    shopCurrencyId: Currencies;

    profile: PersonProfileBo;

    grandPriceGap: number = 0;

    @Input('isReadonly') isReadonly: boolean = false;

    @Input('uniqueId') uniqueId: number = null;// this id is not used here, but it is used to find this comp easly as a child comp.

    busy: boolean = false;
    constructor(
        private optionService: OptionService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.optionListDto = [];
        this.profile = this.localStorageService.personProfile;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(personProductId: number, shopCurrencyId: Currencies, preSelectedOptionIdList: number[]): void {
        this.personProductId = personProductId;
        this.shopCurrencyId = shopCurrencyId;
        this.preSelectedOptionIdList = preSelectedOptionIdList;

        this.selectedOptionIdList = preSelectedOptionIdList;

        if (this.utils.isNull(this.preSelectedOptionIdList)) {
            this.preSelectedOptionIdList = [];
        }

        this.getOptions();
    }

    getOptions(): void {
        const criteriaDto = new OptionGetListCriteriaDto();
        criteriaDto.CaseId = 1; // 1: get list by person product
        criteriaDto.PersonProductId = this.personProductId;

        this.busy = true;
        let subs = this.optionService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.optionListDto = x.Dto;

                    if (this.optionListDto.length > 0) {
                        let tSelectedOption: OptionListDto = null;
                        let i: number = 0;
                        this.optionListDto.forEach(tGroup => {
                            i++;
                            tSelectedOption = tGroup.OptionList.find(f => this.preSelectedOptionIdList.includes(f.Id));
                            if (this.utils.isNull(tSelectedOption)) {
                                tGroup.SelectedOptionId = null;
                            } else {
                                tGroup.SelectedOptionId = tSelectedOption.Id;
                            }

                            if (i == this.optionListDto.length) {
                                this.compBroadCastService.sendMessage(CompBroadCastTypes.Ready, JSON.stringify({ 'OptionSelectComp': { 'personProductId': this.personProductId } }));
                            }
                        });
                    } else {
                        this.compBroadCastService.sendMessage(CompBroadCastTypes.Ready, JSON.stringify({ 'OptionSelectComp': { 'personProductId': this.personProductId } }));
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getOptions', subs);
                this.busy = false;
            }
        );
    }

    isSubmitted: boolean = false;
    isValid(): boolean {
        this.isSubmitted = true;

        if (this.utils.isNull(this.optionListDto) || this.optionListDto.length == 0
            || this.utils.isNull(this.optionListDto.find(f => f.SelectedOptionId == null))) return true;

        return false;
    }

    calculate(): void {
        this.grandPriceGap = 0;

        this.selectedOptionIdList = [];

        let tOption: OptionListDto = null;
        let i: number = 0;
        this.optionListDto.forEach(tGroup => {
            i++;
            if (this.utils.isNotNull(tGroup.SelectedOptionId)) {
                this.selectedOptionIdList.push(tGroup.SelectedOptionId);

                tOption = tGroup.OptionList.find(f => f.Id == tGroup.SelectedOptionId);
                this.grandPriceGap += tOption.PriceGap;
            }

            if (i == this.optionListDto.length) {
                this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'OptionSelectCompCalculate': { 'personProductId': this.personProductId } }));
            }
        });
    }
}