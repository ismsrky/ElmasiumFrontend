import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// Service
import { PersonRelationService } from '../../../../service/person/relation.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonRelationListDto } from '../../../../dto/person/relation/list.dto';
import { PersonRelationGetListCriteriaDto } from '../../../../dto/person/relation/getlist-criteria.dto';

// Bo
import { PersonSearchShowCriteriaBo } from '../../../../bo/person/search-show-criteria.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-search-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonSearchListIndexComp implements OnInit, OnDestroy {
    busy: boolean = false;
    relationList: PersonRelationListDto[];

    waitTill: boolean = false;
    @ViewChild('scrollDiv', { static: false }) private scrollDiv: ElementRef;

    criteriaDto: PersonRelationGetListCriteriaDto;
    criteriaBo: PersonSearchShowCriteriaBo;

    subsNeedRefresh: Subscription;
    constructor(
        private personRelationService: PersonRelationService,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.relationList = [];
    }

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x) && x.includes('PersonRelationSearchCriteria')) {
                    let criteriaDto: PersonRelationGetListCriteriaDto = JSON.parse(x).PersonRelationSearchCriteria;

                    this.criteriaDto = criteriaDto;
                    this.relationList = [];
                    this.loadData();
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
    }

    pushValues(list: PersonRelationListDto[]): void {
        let item: PersonRelationListDto;
        let preChecked: PersonRelationListDto = null;
        list.forEach(element => {
            preChecked = null;
            if (this.utils.isNotNull(this.criteriaBo.PreCheckedList) && this.criteriaBo.PreCheckedList.length > 0) {
                preChecked = this.criteriaBo.PreCheckedList.find(f => f.RelatedPersonId == element.RelatedPersonId);
            }

            if (this.utils.isNull(preChecked)) {
                item = new PersonRelationListDto(this.dicService);
                item.copy(element);
                item.handleCaption(true);
                this.relationList.push(item);
            }
        });
    }

    loadData(): void {
        if (this.waitTill) return;

        this.waitTill = true;

        this.busy = true;
        this.criteriaDto.PageOffSet = this.relationList.length;
        let subs = this.personRelationService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;
                this.waitTill = false;

                if (x.IsSuccess) {
                    /**
                     *  if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                         let found: PersonRelationListDto = null;
                         x.Dto.forEach(element => {
                             found = this.relationList.find(f => f.RelatedPersonId == element.RelatedPersonId);
                             if (this.utils.isNull(found)) {
                                 this.relationList.push(element);
                             }
                         });
                     }
                     */

                    if (this.utils.isNotNull(this.relationList) && this.relationList.length > 0) {
                        if (this.utils.isNull(this.criteriaBo.PreCheckedList)) {
                            this.criteriaBo.PreCheckedList = [];
                        }
                        this.relationList.forEach(element => {
                            if (element.Checked && this.utils.isNull(this.criteriaBo.PreCheckedList.find(y => y.RelatedPersonId == element.RelatedPersonId)))
                                this.criteriaBo.PreCheckedList.push(element);
                        });
                    }
                    
                    setTimeout(() => {
                        // we need to add pre-check values first.
                        // Becuase we want to show pre-check values at top.
                        let count: number = 0;
                        if (this.utils.isNotNull(this.criteriaBo.PreCheckedList) && this.criteriaBo.PreCheckedList.length > 0) {
                            this.criteriaBo.PreCheckedList.forEach(element => {
                                count++;

                                if (this.utils.isNull(this.relationList.find(f => f.RelatedPersonId == element.RelatedPersonId))) {
                                    element.Checked = true;
                                    this.relationList.push(element);
                                }

                                if (this.criteriaBo.PreCheckedList.length == count) {
                                    this.pushValues(x.Dto);
                                }
                            });
                        } else {
                            this.pushValues(x.Dto);
                        }
                    });

                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.waitTill = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    onScroll(event: any): void {
        const scrollPosition = event.srcElement.scrollTop;
        let deger: number = 0;
        deger = this.utils.round(event.srcElement.offsetHeight + scrollPosition, 0);
        if ((this.scrollDiv.nativeElement.scrollHeight - deger) / this.scrollDiv.nativeElement.scrollHeight === 0) {
            this.loadData();
        }
    }

    show(criteriaBo: PersonSearchShowCriteriaBo): void {
        this.criteriaBo = criteriaBo;
    }
}