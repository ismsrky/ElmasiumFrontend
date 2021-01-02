import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// Service
import { PersonProductService } from '../../../../../service/person/product.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { LogExceptionService } from '../../../../../service/log/exception.service';
import { UtilService } from '../../../../../service/sys/util.service';

// Dto
import { PersonProductListDto } from '../../../../../dto/person/product/list.dto';
import { PersonProductGetListCriteriaDto } from '../../../../../dto/person/product/getlist-criteria.dto';

// Bo
import { PersonProductSearchShowCriteriaBo } from '../../../../../bo/person/product/search-show-criteria.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';


@Component({
    selector: 'person-product-search-list-index',
    templateUrl: './index.comp.html'
})
export class PersonProductSearchListIndexComp implements OnInit, OnDestroy {
    productList: PersonProductListDto[];

    criteriaBo: PersonProductSearchShowCriteriaBo;

    subsNeedRefresh: Subscription;

    busy: boolean = false;

    constructor(
        private personProductService: PersonProductService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.productList = [];
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isString(x) && x.includes('PersonProductSearchCriteria')) {
                    const criteriaDto: PersonProductGetListCriteriaDto = JSON.parse(x).PersonProductSearchCriteria;
                    this.loadDataByCriteria(criteriaDto);
                }
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    pushValues(list: PersonProductListDto[]): void {
        let preChecked: PersonProductListDto = null;
        list.forEach(element => {
            preChecked = null;
            if (this.criteriaBo.PreCheckedList && this.criteriaBo.PreCheckedList.length > 0) {
                preChecked = this.criteriaBo.PreCheckedList.find(f => f.Id == element.Id);
            }

            if (this.utils.isNull(preChecked)) {
                this.productList.push(element);
            }
        });
    }
    loadDataByCriteria(getListCriteriaDto: PersonProductGetListCriteriaDto): void {
        this.busy = true;

        let subs = this.personProductService.getList(getListCriteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.productList && this.productList.length > 0) {
                        if (this.utils.isNull(this.criteriaBo.PreCheckedList)) {
                            this.criteriaBo.PreCheckedList = [];
                        }
                        this.productList.forEach(element => {
                            if (element.Checked && this.utils.isNull(this.criteriaBo.PreCheckedList.find(y => y.Id == element.Id)))
                                this.criteriaBo.PreCheckedList.push(element);
                        });
                    }

                    this.productList = [];

                    // we need to add pre-check values first.
                    // Becuase we want to show pre-check values at top.
                    let count: number = 0;
                    if (this.criteriaBo.PreCheckedList && this.criteriaBo.PreCheckedList.length > 0) {
                        this.criteriaBo.PreCheckedList.forEach(element => {
                            count++;

                            element.Checked = true;
                            this.productList.push(element);

                            if (this.criteriaBo.PreCheckedList.length == count) {
                                this.pushValues(x.Dto);
                            }
                        });
                    } else {
                        this.pushValues(x.Dto);
                    }
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadDataByCriteria', subs);
                this.busy = false;
            }
        );
    }
}