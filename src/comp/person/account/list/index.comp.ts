import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { PersonAccountActivityListIndexComp } from '../activity/list/index.comp';
import { PersonAccountCrudComp } from '../crud/crud.comp';
import { PageTitleComp } from '../../../general/page-title/page-title.comp';

// Service
import { PersonRelationService } from '../../../../service/person/relation.service';
import { PersonAccountService } from '../../../../service/person/account.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { PersonAccountListDto } from '../../../../dto/person/account/list.dto';
import { PersonAccountGetListCriteriaDto } from '../../../../dto/person/account/getlist-criteria.dto';
import { PersonAccountActivityGetListCriteriaDto } from '../../../../dto/person/account/activity-getlist-criteria.dto';
import { PersonAccountDeleteDto } from '../../../../dto/person/account/delete.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { expandCollapse } from '../../../../stc';
import { ApprovalStats } from '../../../../enum/approval/stats.enum';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';
import { RelationTypes } from '../../../../enum/person/relation-types.enum';
import { PersonTypes } from '../../../../enum/person/person-types.enum';

@Component({
    selector: 'person-account-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonAccountListIndexComp implements OnInit, OnDestroy {
    accountList: PersonAccountListDto[];
    criteriaDto: PersonAccountGetListCriteriaDto;

    profile: PersonProfileBo;

    newPersonAccountListDto: PersonAccountListDto;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;

    @ViewChild('updatePersonAccount', { static: false }) updatePersonAccount: PersonAccountCrudComp;
    @ViewChild('newPersonAccount', { static: false }) newPersonAccount: PersonAccountCrudComp;

    @ViewChild(PersonAccountActivityListIndexComp, { static: false }) childActivities: PersonAccountActivityListIndexComp;

    subsNeedRefresh: Subscription;
    subsSaved: Subscription;

    busy: boolean = false;

    personTypes = PersonTypes;
    constructor(
        private personAccountService: PersonAccountService,
        private personRelationService: PersonRelationService,
        private localStorageService: LocalStorageService,
        private dicService: DictionaryService,
        private compBroadCastService: CompBroadCastService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.profile = this.localStorageService.personProfile;

        this.newPersonAccountListDto = new PersonAccountListDto();
        this.accountList = [];

        // This code must stand here becuase it confuses with the criteria comp.
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                } else if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    if (x.includes('PersonAccountListCriteria')) {
                        this.criteriaDto = JSON.parse(x).PersonAccountListCriteria;
                        this.loadData();
                    }
                }
            }
        );
    }

    ngOnInit(): void {
        this.subsSaved = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.Saved).subscribe(
            x => {
                if (x == 'PersonAccount') {
                    this.newPersonAccountListDto.IsCrudOpen = false;
                    this.loadData();
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subsSaved);
    }

    loadData(): void {
        if (this.utils.isNull(this.criteriaDto)) return;

        this.busy = true;
        let subs = this.personAccountService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.accountList = x.Dto
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

    getActivities(listItem: PersonAccountListDto): void {
        listItem.IsActivitiesOpen = !listItem.IsActivitiesOpen;

        if (listItem.IsActivitiesOpen) {
            this.accountList.forEach(element => {
                if (element.Id != listItem.Id)
                    element.IsActivitiesOpen = false;
            });
        } else {
            return;
        }

        setTimeout(() => {
            const criteriaDto = new PersonAccountActivityGetListCriteriaDto();
            criteriaDto.OwnerPersonId = this.criteriaDto.OwnerPersonId;
            criteriaDto.CurrencyId = this.localStorageService.personProfile.SelectedCurrencyId;

            criteriaDto.AccountIdList = [];
            criteriaDto.AccountIdList.push(listItem.Id);

            criteriaDto.ApprovalStatIdList = [];
            criteriaDto.ApprovalStatIdList.push(ApprovalStats.xAccepted);
            criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPending);
            criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPulledBack);
            criteriaDto.ApprovalStatIdList.push(ApprovalStats.xRejected);

            this.childActivities.showInside(criteriaDto, listItem.Name);
        });
    }

    openModal(id: number): void {
        if (!this.personRelationService.hasRelationIn(RelationTypes.xMyself, RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
            return;
        }

        const accountDto = this.accountList.find(f => f.Id == id);

        if (this.utils.isNotNull(accountDto) && !accountDto.IsCrudOpen) {
            accountDto.IsCrudOpen = true;

            // we need to close others.
            this.accountList.forEach(element => {
                if (element.Id != accountDto.Id)
                    element.IsCrudOpen = false;
            });

            setTimeout(() => {
                this.updatePersonAccount.showModal(id);
            });
        } else if (this.utils.isNull(accountDto) && !this.newPersonAccountListDto.IsCrudOpen) {
            this.newPersonAccountListDto.IsCrudOpen = true;
            setTimeout(() => {
                this.newPersonAccount.showModal(0);
            });
        }
    }

    delete(listItem: PersonAccountListDto): void {
        if (!this.personRelationService.hasRelationIn(RelationTypes.xMyself, RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
            return;
        }

        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDelete'),
            icon: DialogIcons.None,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                this.busy = true;
                const deleteDto = new PersonAccountDeleteDto();
                deleteDto.AccountId = listItem.Id;
                let subs = this.personAccountService.delete(deleteDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            this.toastr.success(this.dicService.getValue('xDeletedSuccess'));

                            this.removeItem(listItem.Id);
                        } else {
                            this.dialogService.showError(x.Message);
                        }
                    },
                    err => {
                        this.logExService.saveObservableEx(err, this.constructor.name, 'delete', subs);
                this.busy = false;
                    }
                );
            }
        });
    }

    removeItem(id: number): void {
        const ind: number = this.accountList.findIndex(x => x.Id == id);
        this.accountList.splice(ind, 1);
    }
}