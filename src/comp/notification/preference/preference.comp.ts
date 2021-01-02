import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// Comp

// Service
import { NotificationPreferenceService } from '../../../service/notification/preference.service';
import { DialogService } from '../../../service/sys/dialog.service';
import { DictionaryService } from '../../../service/dictionary/dictionary.service';
import { LogExceptionService } from '../../../service/log/exception.service';
import { UtilService } from '../../../service/sys/util.service';

// Dto
import { NotificationPreferenceListDto } from '../../../dto/notification/preference/list.dto';
import { NotificationPreferenceSaveDto } from '../../../dto/notification/preference/save.dto';
import { NotificationPreferenceDto } from '../../../dto/notification/preference/preference.dto';

// Bo

// Enum
import { NotificationChannels } from '../../../enum/notification/channels.enum';
import { NotificationPreferenceTypes } from '../../../enum/notification/preference-types.enum';
import { RelationTypes } from '../../../enum/person/relation-types.enum';
import { expandCollapse } from '../../../stc';

@Component({
    selector: 'notification-preference',
    templateUrl: './preference.comp.html',
    animations: [expandCollapse]
})
export class NotificationPreferenceComp implements OnInit, OnDestroy {
    listDto: NotificationPreferenceListDto[];
    preferenceList: NotificationPreferenceDto[];

    relationTypes = RelationTypes;
    notificationChannels = NotificationChannels;
    notificationPreferenceTypes = NotificationPreferenceTypes;

    busy: boolean = false;

    constructor(
        private notificationPreferenceService: NotificationPreferenceService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    show(): void {
        this.loadData();
    }

    loadData(): void {
        this.busy = true;
        let subs = this.notificationPreferenceService.getList().subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.listDto = x.Dto;
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

    save(): void {
        this.preferenceList = [];
        let i: number = 0;
        let f: number = 0;
        let z: number = 0;
        this.listDto.forEach(tProfile => {
            i++;
            f = 0;
            z = 0;
            tProfile.TypeList.forEach(tType => {
                f++;
                z = 0;
                tType.SubList.forEach(tSub => {
                    z++;
                    const tListItem = new NotificationPreferenceDto();
                    tListItem.Id = tSub.Id;
                    tListItem.Preference = tSub.Preference;

                    this.preferenceList.push(tListItem);

                    if (i == this.listDto.length && f == tProfile.TypeList.length && z == tType.SubList.length) {
                        const saveDto = new NotificationPreferenceSaveDto();
                        saveDto.PreferenceList = this.preferenceList;
                        this.busy = true;
                        let subs = this.notificationPreferenceService.save(saveDto).subscribe(
                            x => {
                                this.utils.unsubs(subs);
                this.busy = false;

                                if (x.IsSuccess) {
                                    this.toastr.success(this.dicService.getValue('xTransactionSuccessful'));

                                    // this.loadData();
                                } else {
                                    this.dialogService.showError(x.Message);
                                }
                            },
                            err => {
                                this.logExService.saveObservableEx(err, this.constructor.name, 'save', subs);
                this.busy = false;
                            }
                        );
                    }
                });
            });
        });


    }
}