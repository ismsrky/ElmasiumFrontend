import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

//Comp
import { CommentCrudComp } from '../crud/crud.comp';
import { WarningCrudComp } from '../../warning/crud/crud.comp';

// Service
import { CommentService } from '../../../service/comment/comment.service';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { CommentGetListCriteriaDto } from '../../../dto/comment/getlist-criteria.dto';
import { CommentListDto } from '../../../dto/comment/list.dto';

// Enum
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { CommentSortTypes } from '../../../enum/comment/sort-types.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'comment-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class CommentListIndexComp implements OnInit, OnDestroy {
    commentList: CommentListDto[];

    criteriaDto: CommentGetListCriteriaDto;

    @ViewChild(CommentCrudComp, { static: false }) childCommentComp: CommentCrudComp;
    @ViewChild(WarningCrudComp, { static: false }) childWarning: WarningCrudComp;

    subsShowModal: Subscription;
    subsDeleted: Subscription;
    subsSaved: Subscription;

    busy: boolean = false;

    caseId: number = null;

    commentSortTypes = CommentSortTypes;

    constructor(
        private commentService: CommentService,
        private compBroadCastService: CompBroadCastService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private dialogService: DialogService) {
        this.criteriaDto = new CommentGetListCriteriaDto();
        this.commentList = [];
    }

    ngOnInit(): void {
        this.subsDeleted = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Deleted).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('CommentCrudComp')) {
                        //const productCommentId: number = JSON.parse(x).ProductComment;

                        //this.removeItem(productCommentId);

                        this.loadData();
                    }
                }
            }
        );
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('CommentCrudComp')) {
                        this.loadData();
                    }
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsShowModal);
        this.utils.unsubs(this.subsDeleted);
        this.utils.unsubs(this.subsSaved);
    }

    showCase0(shopId: number, productId: number): void {
        this.caseId = 0;

        this.criteriaDto = this.commentService.getGetListCriteriaCase0(shopId, productId);

        this.loadData();
    }
    showCase1(shopId: number): void {
        this.caseId = 1;

        this.criteriaDto = this.commentService.getGetListCriteriaCase1(shopId);

        this.loadData();
    }
    showCase2(): void {
        this.caseId = 2;

        this.criteriaDto = this.commentService.getGetListCriteriaCase2();

        this.loadData();
    }
    showCase3(shopId: number): void {
        this.caseId = 3;

        this.criteriaDto = this.commentService.getGetListCriteriaCase3(shopId);

        this.loadData();
    }

    loadData(): void {
        this.busy = true;

        this.criteriaDto.PageOffSet = 0;
        // TODO:
        // Handle page offset later. I did not do this because it is not so much important.
        // this.criteriaDto.PageOffSet = this.commentList.length;
        let subs = this.commentService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.commentList = x.Dto;
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

    removeItem(id: number): void {
        const ind: number = this.commentList.findIndex(x => x.Id == id);
        this.commentList.splice(ind, 1);
    }
}