import { Component, OnInit, ViewChild, OnDestroy, Host, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

// Service
import { PersonRelationService } from '../../../../../service/person/relation.service';
import { ApprovalRelationService } from '../../../../../service/approval/relation.service';
import { CompBroadCastService } from '../../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../../service/sys/dialog.service';
import { DictionaryService } from '../../../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';

//Comp
import { PersonRelationFindListCriteriaComp } from './criteria/criteria.comp';
import { PageTitleComp } from '../../../../general/page-title/page-title.comp';

// Dto
import { PersonRelationFindListDto } from '../../../../../dto/person/relation/find/list.dto';
import { PersonRelationFindGetListCriteriaDto } from '../../../../../dto/person/relation/find/getlist-criteria.dto';
import { ApprovalRelationRequestDto } from '../../../../../dto/approval/relation/request.dto';

// Enum
import { CompBroadCastTypes } from '../../../../../enum/sys/comp-broadcast-types.enum';
import { ApprovalStats } from '../../../../../enum/approval/stats.enum';
import { RelationTypes } from '../../../../../enum/person/relation-types.enum';
import { Stc, expandCollapse } from '../../../../../stc';
import { UtilService } from '../../../../../service/sys/util.service';
import { LogExceptionService } from '../../../../../service/log/exception.service';

@Component({
    selector: 'person-relation-find-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonRelationFindListIndexComp implements OnInit, OnDestroy {
    findList: PersonRelationFindListDto[];
    criteriaDto: PersonRelationFindGetListCriteriaDto;

    @Input('IsInside') IsInside: boolean = false;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;
    @ViewChild(PersonRelationFindListCriteriaComp, { static: false }) childCriteria: PersonRelationFindListCriteriaComp;

    subscriptionCriteria: Subscription;

    busy: boolean = false;

    constructor(
        private approvalRelationService: ApprovalRelationService,
        private compBroadCastService: CompBroadCastService,
        private personRelationService: PersonRelationService,
        private toastr: ToastrService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.findList = [];
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.subscriptionCriteria = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
                x => {
                    if (this.utils.isNotNull(x) && this.utils.isString(x) && x.includes('PersonRelationFindListCriteria')) {
                        this.criteriaDto = JSON.parse(x).PersonRelationFindListCriteria;
                        this.loadData();
                    }
                }
            );
        });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subscriptionCriteria);
    }

    loadData(): void {
        if (this.utils.isNull(this.criteriaDto) || this.utils.isNull(this.criteriaDto.Name)) return;

        this.busy = true;
        let subs = this.personRelationService.getFindList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.findList = x.Dto
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    makeRequest(listItem: PersonRelationFindListDto): void {
        if (this.criteriaDto.RelationTypeId == RelationTypes.xShopOwner && !this.personRelationService.hasRelationIn(RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthAddShopOwnerForShop'));
            return;
        }
        if (this.criteriaDto.RelationTypeId == RelationTypes.xStaff && !this.personRelationService.hasRelationIn(RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthAddStaffForShop'));
            return;
        }

        const requestDto = new ApprovalRelationRequestDto();
        requestDto.ParentPersonId = this.criteriaDto.ParentPersonId;
        requestDto.ChildPersonId = listItem.PersonId;
        requestDto.ChildRelationTypeId = this.criteriaDto.RelationTypeId;

        this.busy = true;
        let subs = this.approvalRelationService.makeRequest(requestDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.toastr.success(this.dicService.getValue('xConnectionRequestSent'));

                    listItem.ApprovalStatId = ApprovalStats.xPending;
                    listItem.IsParent = true;

                    this.close();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'makeRequest', subs);
                this.busy = false;
            }
        );
    }

    showInside(criteriaDto: PersonRelationFindGetListCriteriaDto): void {
        this.childCriteria.showInside(criteriaDto);

        this.criteriaDto = criteriaDto;
    }

    close(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonRelationFindListIndexComp');
    }
}