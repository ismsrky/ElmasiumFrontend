import { Component, ViewChild } from '@angular/core';

// Comp
import { CommentListIndexComp } from '../../comment/list/index.comp';
import { NotificationPreferenceComp } from '../../notification/preference/preference.comp';
import { PersonAddressListIndexComp } from '../address/list/index.comp';

// Service
import { CommentService } from '../../../service/comment/comment.service';
import { LocalStorageService } from '../../../service/sys/local-storage.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { PersonAddressGetListCriteriaDto } from '../../../dto/person/address/getlist-criteria.dto';
import { CommentGetListCriteriaDto } from '../../../dto/comment/getlist-criteria.dto';

// Enum
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'person-my-profile',
    templateUrl: './my-profile.comp.html',
    animations: [expandCollapse]
})
export class PersonMyProfileComp {
    tabPageIndex: number = 0;

    @ViewChild(CommentListIndexComp, { static: false }) childCommentListComp: CommentListIndexComp;
    @ViewChild(PersonAddressListIndexComp, { static: false }) childPersonAddressListIndexComp: PersonAddressListIndexComp;
    @ViewChild(NotificationPreferenceComp, { static: false }) childNotificationPreferenceComp: NotificationPreferenceComp;

    commentCountMines: number = null; // case Id: 2

    constructor(
        private commentService: CommentService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.countCommentList();
    }

    openGeneral(): void {
        this.tabPageIndex = 0;
    }
    openCommentList(): void {
        this.tabPageIndex = 1;

        setTimeout(() => {
            this.childCommentListComp.showCase2();
        });
    }
    countCommentList(): void {
        let criteriaDto: CommentGetListCriteriaDto = null;
        criteriaDto = this.commentService.getGetListCriteriaCase2();

        let subs = this.commentService.getListCount(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.commentCountMines = x.ReturnedId;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'countCommentList', subs);
            }
        );
    }

    openAddress(): void {
        this.tabPageIndex = 2;

        setTimeout(() => {
           const criteriaDto = new PersonAddressGetListCriteriaDto();
            criteriaDto.OwnerPersonId = this.localStorageService.personProfile.PersonId;
            criteriaDto.AddressTypeIdList = [];
            criteriaDto.StatId = null;
            this.childPersonAddressListIndexComp.show(criteriaDto);
        });
    }

    openNotificationPreference(): void {
        this.tabPageIndex = 3;

        setTimeout(() => {
            this.childNotificationPreferenceComp.show();
        });
    }
}