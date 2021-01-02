import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { CommentService } from '../../../../service/comment/comment.service';
import { WarningService } from '../../../../service/warning/warning.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { CommentListDto } from '../../../../dto/comment/list.dto';
import { CommentGetActionsCriteriaDto } from '../../../../dto/comment/getactions-criteria.dto';
import { CommentLikeDto } from '../../../../dto/comment/like.dto';
import { CommentGetListCriteriaDto } from '../../../../dto/comment/getlist-criteria.dto';

// Enum
import { WarningModuleTypes } from '../../../../enum/warning/module-types.enum';
import { CommentTypes } from '../../../../enum/comment/types.enum';
import { expandCollapse } from '../../../../stc';

@Component({
    selector: 'comment-list-item',
    templateUrl: './item.comp.html',
    animations: [expandCollapse]
})
export class CommentListItemComp implements OnInit, OnDestroy {
    @Input('listItem') listItem: CommentListDto;
    @Input('caseId') caseId: number;

    replyCommentDto: CommentListDto;

    commentTypes = CommentTypes;

    busy: boolean = false;
    constructor(
        private dicService: DictionaryService,
        private warningService: WarningService,
        private commentService: CommentService,
        private toastr: ToastrService,
        private logExService: LogExceptionService,
        private utils: UtilService,
        private dialogService: DialogService) {
    }

    ngOnInit(): void {
        this.getActions();
        this.getReplyComment();
    }
    ngOnDestroy(): void {
    }

    warn(listItem: CommentListDto): void {
        this.warningService.showModal(WarningModuleTypes.Comment, listItem.Id);
    }

    saveLike(listItem: CommentListDto, isLike: boolean): void {
        const saveDto = new CommentLikeDto();
        saveDto.CommentId = listItem.Id;
        saveDto.IsLike = isLike;

        let subs = this.commentService.saveLike(saveDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {

                    if (this.utils.isNotNull(listItem.MyLike) && listItem.MyLike == saveDto.IsLike) {
                        listItem.LikeCount += saveDto.IsLike ? -1 : 0;
                        listItem.DislikeCount += saveDto.IsLike ? 0 : -1;

                        listItem.MyLike = null;
                    } else if (this.utils.isNotNull(listItem.MyLike) && listItem.MyLike != saveDto.IsLike) {
                        listItem.LikeCount += saveDto.IsLike ? 1 : -1;
                        listItem.DislikeCount += saveDto.IsLike ? -1 : 1;

                        listItem.MyLike = saveDto.IsLike;
                    } else {
                        listItem.LikeCount += saveDto.IsLike ? 1 : 0;
                        listItem.DislikeCount += saveDto.IsLike ? 0 : 1;

                        listItem.MyLike = saveDto.IsLike;
                    }

                    this.toastr.success(this.dicService.getValue('xThanksFeedBack'));

                    // this.loadData();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
            }
        );
    }

    edit(listItem: CommentListDto): void {
        this.commentService.showModalListItem(listItem);
    }
    reply(listItem: CommentListDto): void {
        this.commentService.showModalReply(listItem);
    }

    getActions(): void {
        if (this.listItem.GotActions) return;

        this.listItem.GotActions = true;

        const criteriaDto = new CommentGetActionsCriteriaDto();
        criteriaDto.CommentId = this.listItem.Id;
        let subs = this.commentService.getActions(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.listItem.ActionsDto = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getActions', subs);
            }
        );
    }

    getReplyComment(): void {
        if (this.listItem.GotReplyComment || this.utils.isNull(this.listItem.RelatedCommentId) || this.listItem.CommentTypeId == CommentTypes.ReplyPerson || this.listItem.CommentTypeId == CommentTypes.ReplyPersonProduct) return;

        this.listItem.GotReplyComment = true;

        this.busy = true;
        const criteriaDto = new CommentGetListCriteriaDto();
        criteriaDto.CaseId = 4;
        criteriaDto.CommentId = this.listItem.RelatedCommentId;
        let subs = this.commentService.getList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        this.replyCommentDto = x.Dto[0];
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getReplyComment', subs);
                this.busy = false;
            }
        );
    }
}