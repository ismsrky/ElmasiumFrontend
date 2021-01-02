import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Service
import { FicheService } from '../../../../service/fiche/fiche.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';

// Dto
import { FicheListDto } from '../../../../dto/fiche/list.dto';
import { FicheGetListCriteriaDto } from '../../../../dto/fiche/getlist-criteria.dto';

// Bo
import { FicheSearchShowCriteriaBo } from '../../../../bo/fiche/search-show-criteria.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { UtilService } from '../../../../service/sys/util.service';
import { LogExceptionService } from '../../../../service/log/exception.service';

@Component({
    selector: 'fiche-search-list-index',
    templateUrl: './index.comp.html'
})
export class FicheSearchListIndexComp implements OnInit, OnDestroy {
    constructor(
        private ficheService: FicheService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.ficheListDto = [];
    }

    busy: boolean = false;
    ficheListDto: FicheListDto[];

    criteriaBo: FicheSearchShowCriteriaBo;

    criteriaChangedSubscription: Subscription;

    ngOnInit(): void {
        this.criteriaChangedSubscription = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            data => {
                if (this.utils.isNotNull(data) && this.utils.isString(data) && data.includes('FicheSearchCriteria')) {
                    const criteriaDto: FicheGetListCriteriaDto = JSON.parse(data).FicheSearchCriteria;
                    this.loadDataByCriteria(criteriaDto);
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.criteriaChangedSubscription);
    }

    pushValues(list: FicheListDto[]): void {
        let preChecked: FicheListDto = null;
        list.forEach(element => {
            preChecked = null;
            if (this.criteriaBo.PreCheckedList && this.criteriaBo.PreCheckedList.length > 0) {
                preChecked = this.criteriaBo.PreCheckedList.find(f => f.Id == element.Id);
            }

            if (this.utils.isNull(preChecked)) {
                this.ficheListDto.push(element);
            }
        });
    }
    loadDataByCriteria(getListCriteriaDto: FicheGetListCriteriaDto): void {
        this.busy = true;


        let subs = this.ficheService.getList(getListCriteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;


                if (x.IsSuccess) {
                    if (this.ficheListDto && this.ficheListDto.length > 0) {
                        if (this.utils.isNull(this.criteriaBo.PreCheckedList)) {
                            this.criteriaBo.PreCheckedList = [];
                        }
                        this.ficheListDto.forEach(element => {
                            if (element.Checked && this.utils.isNull(this.criteriaBo.PreCheckedList.find(y => y.Id == element.Id)))
                                this.criteriaBo.PreCheckedList.push(element);
                        });
                    }

                    this.ficheListDto = [];

                    // we need to add pre-check values first.
                    // Becuase we want to show pre-check values at top.
                    let count: number = 0;
                    if (this.criteriaBo.PreCheckedList && this.criteriaBo.PreCheckedList.length > 0) {
                        this.criteriaBo.PreCheckedList.forEach(element => {
                            count++;

                            element.Checked = true;
                            this.ficheListDto.push(element);

                            if (this.criteriaBo.PreCheckedList.length == count) {
                                this.pushValues(x.Dto);
                            }
                        });
                    } else {
                        this.pushValues(x.Dto);
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadDataByCriteria', subs);
                this.busy = false;
            }
        );
    }
}