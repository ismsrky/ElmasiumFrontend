import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Services
import { PersonAccountService } from '../../../../../service/person/account.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonAccountListDto } from '../../../../../dto/person/account/list.dto';
import { PersonAccountGetListCriteriaDto } from '../../../../../dto/person/account/getlist-criteria.dto';

// Bo
import { PersonAccountSearchShowCriteriaBo } from '../../../../../bo/person/account/search-show-criteria.bo';
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';

@Component({
    selector: 'person-account-search-list-index',
    templateUrl: './index.comp.html'
})
export class PersonAccountSearchListIndexComp implements OnInit, OnDestroy {
    accountList: PersonAccountListDto[];

    criteriaBo: PersonAccountSearchShowCriteriaBo;

    subsNeedRefresh: Subscription;

    busy: boolean = false;

    constructor(
        private personAccountService: PersonAccountService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService, ) {
        this.accountList = [];
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            data => {
                if (this.utils.isString(data) && data.includes('PersonAccountSearchCriteria')) {
                    const criteriaDto: PersonAccountGetListCriteriaDto = JSON.parse(data).PersonAccountSearchCriteria;
                    this.loadDataByCriteria(criteriaDto);
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    pushValues(list: PersonAccountListDto[]): void {
        let preChecked: PersonAccountListDto = null;
        list.forEach(element => {
            preChecked = null;
            if (this.criteriaBo.PreCheckedList && this.criteriaBo.PreCheckedList.length > 0) {
                preChecked = this.criteriaBo.PreCheckedList.find(f => f.Id == element.Id);
            }

            if (this.utils.isNull(preChecked)) {
                this.accountList.push(element);
            }
        });
    }

    loadDataByCriteria(getListCriteriaDto: PersonAccountGetListCriteriaDto): void {
        this.busy = true;

        let subs = this.personAccountService.getList(getListCriteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.accountList && this.accountList.length > 0) {
                        if (this.utils.isNull(this.criteriaBo.PreCheckedList)) {
                            this.criteriaBo.PreCheckedList = [];
                        }
                        this.accountList.forEach(element => {
                            if (element.Checked && this.utils.isNull(this.criteriaBo.PreCheckedList.find(y => y.Id == element.Id)))
                                this.criteriaBo.PreCheckedList.push(element);
                        });
                    }

                    this.accountList = [];

                    // we need to add pre-check values first.
                    // Becuase we want to show pre-check values at top.
                    let count: number = 0;
                    if (this.criteriaBo.PreCheckedList && this.criteriaBo.PreCheckedList.length > 0) {
                        this.criteriaBo.PreCheckedList.forEach(element => {
                            count++;

                            element.Checked = true;
                            this.accountList.push(element);

                            if (this.criteriaBo.PreCheckedList.length == count) {
                                this.pushValues(x.Dto);
                            }
                        });
                    } else {
                        this.pushValues(x.Dto);
                    }
                }
                this.busy = false;
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadDataByCriteria', subs);
                this.busy = false;
            }
        );
    }
}