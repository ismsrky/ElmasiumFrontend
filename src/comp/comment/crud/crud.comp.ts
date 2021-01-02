import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';

// Service
import { CommentService } from '../../../service/comment/comment.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { ToastrService } from 'ngx-toastr';
import { CompBroadCastService } from '../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { CommentDto } from '../../../dto/comment/comment.dto';
import { CommentGetCriteriaDto } from '../../../dto/comment/get-criteria.dto';
import { CommentDeleteDto } from '../../../dto/comment/delete.dto';

// Bo
import { ModalCommentSaveBo } from '../../../bo/modal/comment-save.bo';
import { PersonProfileBo } from '../../../bo/person/profile.bo';

// Enum
import { DialogIcons } from '../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../enum/sys/dialog/dialog-buttons.enum';
import { CompBroadCastTypes } from '../../../enum/sys/comp-broadcast-types.enum';
import { CommentTypes } from '../../../enum/comment/types.enum';

@Component({
    selector: 'comment-crud',
    templateUrl: './crud.comp.html'
})
export class CommentCrudComp implements OnInit, OnDestroy {
    commentDto: CommentDto;
    commentSaveBo: ModalCommentSaveBo;

    @ViewChild('commentForm', { static: false }) commentForm: NgForm;
    @ViewChild(ModalDirective, { static: false }) modal: ModalDirective;

    profile: PersonProfileBo;

    xDesc: string = '';

    commentTypes = CommentTypes;

    busy: boolean = false;
    constructor(
        private commentService: CommentService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private dialogService: DialogService,
        private toastr: ToastrService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.commentDto = new CommentDto();
        this.commentSaveBo = new ModalCommentSaveBo();

        this.profile = this.localStorageService.personProfile;
    }

    isNew: boolean = false;

    xCommentPlaceHolder: string = '';

    showModal(commentSaveBo: ModalCommentSaveBo): void {
        this.commentSaveBo = commentSaveBo;

        this.xDesc = this.commentSaveBo.IsAuthorSeller ? 'xRateCustomerDesc' : 'xRateSellerDesc';

        if (this.utils.isNull(this.commentSaveBo.CommentId) || this.commentSaveBo.CommentId <= 0) {
            this.isNew = true;
            this.commentDto = new CommentDto();

            this.commentDto.OrderId = this.commentSaveBo.OrderId;
            this.commentDto.CommentTypeId = this.commentSaveBo.CommentTypeId;
            this.commentDto.OrderProductId = this.commentSaveBo.CommentTypeId == CommentTypes.PersonProduct ? this.commentSaveBo.RelatedId : null;
            this.commentDto.PersonId = this.commentSaveBo.CommentTypeId == CommentTypes.Person ? this.commentSaveBo.RelatedId : null;

            if (this.utils.isNotNull(this.commentSaveBo.ReplyCommentId) && this.commentSaveBo.ReplyCommentId > 0) {
                this.commentDto.RelatedCommentId = this.commentSaveBo.ReplyCommentId;
            }
        } else {
            this.isNew = false;
            this.get();
        }

        if (this.utils.isNull(this.commentSaveBo.ReplyCommentId)) {
            this.xCommentPlaceHolder = 'xCommentOptional';
        } else {
            this.xCommentPlaceHolder = 'xCommentReplyRequired';
        }

        let subscribeCloseModal = this.modal.onHide.subscribe(
            x => {
                this.utils.unsubs(subscribeCloseModal);

                this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'CommentCrudComp');
            }
        );

        this.modal.show();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    save(): void {
        if (this.commentForm.invalid) {
            return;
        }

        if (this.commentForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }
        if (this.commentDto.CommentTypeId != CommentTypes.ReplyPerson && this.commentDto.CommentTypeId != CommentTypes.ReplyPersonProduct && this.commentDto.Star <= 0) {
            this.toastr.warning(this.dicService.getValue('xSelectStar'));
            return;
        }

        this.busy = true;

        let subscribeSave = this.commentService.save(this.commentDto).subscribe(
            x => {
                this.utils.unsubs(subscribeSave);
                this.busy = false;

                if (x.IsSuccess) {
                    this.commentDto.Id = x.ReturnedId;

                    this.compBroadCastService.sendMessage(CompBroadCastTypes.Saved, JSON.stringify({ 'CommentCrudComp': this.commentDto }));

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));

                    this.modal.hide();
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.utils.unsubs(subscribeSave);
                this.busy = false;

                this.toastr.error(err);
            }
        );
    }
    cancel(): void {
        this.modal.hide();
    }

    get(): void {
        this.busy = true;
        const criteriaDto = new CommentGetCriteriaDto();
        criteriaDto.CommentId = this.commentSaveBo.CommentId;
        let subs = this.commentService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.utils.isNull(x.Dto)) {
                        this.toastr.warning(this.dicService.getValue('xNoRecordsFound'));
                        this.modal.hide();
                    } else {
                        this.commentDto = x.Dto;
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'get', subs);
                this.busy = false;
            }
        );
    }

    delete(): void {
        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.busy = true;
                const deleteDto = new CommentDeleteDto();
                deleteDto.CommentId = this.commentSaveBo.CommentId;
                let subs = this.commentService.delete(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.compBroadCastService.sendMessage(CompBroadCastTypes.Deleted, JSON.stringify({ 'CommentCrudComp': this.commentDto }));

                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.modal.hide();
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'get', subs);
                this.busy = false;
                    }
                );
            }
        });
    }
}