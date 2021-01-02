import { Component, OnInit, OnDestroy, Input } from '@angular/core';

// Service
import { IncludeExcludeService } from '../../../service/include-exclude/include-exclude.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '.././../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { IncludeExcludeGetListCriteriaDto } from '../../../dto/include-exclude/getlist-criteria.dto';
import { IncludeExcludeDto } from '../../../dto/include-exclude/include-exclude.dto';

// Bo
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../stc';
import { Currencies } from '../../../enum/person/currencies.enum';


@Component({
    selector: 'include-exclude-select',
    templateUrl: './select.comp.html',
    animations: [expandCollapse]
})
export class IncludeExcludeSelectComp implements OnInit, OnDestroy {
    ieListDto: IncludeExcludeDto[] = [];

    personProductId: number;

    preSelectedIdList: number[] = [];
    selectedIdList: number[] = [];

    shopCurrencyId: Currencies;

    profile: PersonProfileBo;

    grandPriceGap: number = 0;

    @Input('isInclude') isInclude: boolean = false;
    @Input('isReadonly') isReadonly: boolean = false;

    @Input('showExpandBtn') showExpandBtn: boolean = false;

    @Input('uniqueId') uniqueId: number = null; // this id is not used here, but it is used to find this comp easly as a child comp.

    xCaptionStr: string = '';

    isExpanded: boolean = false;

    busy: boolean = false;
    constructor(
        private ieService: IncludeExcludeService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(personProductId: number, shopCurrencyId: Currencies, preSelectedIdList: number[]): void {
        preSelectedIdList = this.utils.isNull(preSelectedIdList) ? [] : preSelectedIdList;

        this.personProductId = personProductId;
        this.shopCurrencyId = shopCurrencyId;
        this.preSelectedIdList = preSelectedIdList;

        this.xCaptionStr = this.isInclude ? 'xExtra' : 'xExcluding';

        this.selectedIdList = preSelectedIdList;

        this.getIeList();
    }

    getIeList(): void {
        const criteriaDto = new IncludeExcludeGetListCriteriaDto();
        criteriaDto.CaseId = 1; // 1: get list by person product
        criteriaDto.PersonProductId = this.personProductId;
        criteriaDto.IsInclude = this.isInclude;

        this.busy = true;
        let subs = this.ieService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.ieListDto = x.Dto;

                    if (this.ieListDto.length > 0 && this.preSelectedIdList.length > 0) {
                        let i: number = 0;
                        this.ieListDto.forEach(element => {
                            i++;
                            element.IsSelected = this.preSelectedIdList.includes(element.Id);

                            if (i == this.ieListDto.length) {
                                this.compBroadCastService.sendMessage(CompBroadCastTypes.Ready, JSON.stringify({ 'IncludeExcludeSelectComp': { 'personProductId': this.personProductId, 'isInclude': this.isInclude } }));
                            }
                        });
                    } else {
                        this.compBroadCastService.sendMessage(CompBroadCastTypes.Ready, JSON.stringify({ 'IncludeExcludeSelectComp': { 'personProductId': this.personProductId, 'isInclude': this.isInclude } }));
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getIeList', subs);
                this.busy = false;
            }
        );
    }

    ieClick(ie: IncludeExcludeDto): void {
        if (this.isReadonly) return;
        ie.IsSelected = !ie.IsSelected;

        this.calculate();
    }

    calculate(): void {
        this.grandPriceGap = 0;

        this.selectedIdList = [];

        let i: number = 0;
        this.ieListDto.forEach(element => {
            i++;

            if (element.IsSelected) {
                this.selectedIdList.push(element.Id);

                this.grandPriceGap += element.PriceGap;
            }

            if (i == this.ieListDto.length) {
                this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'IncludeExcludeSelectCompCalculate': { 'personProductId': this.personProductId } }));
            }
        });
    }
}