import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

// Comp
import { FicheCrudComp } from '../../../fiche/crud/crud.comp';
import { FicheListIndexComp } from '../../../fiche/list/index.comp';
import { PersonRelationFindListIndexComp } from '../find/list/index.comp';
import { PersonAloneCrudComp } from '../../alone/crud/crud.comp';
import { PageTitleComp } from '../../../general/page-title/page-title.comp';

// Service
import { PersonRelationService } from '../../../../service/person/relation.service';
import { LocalStorageService } from '../../../../service/sys/local-storage.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { CompBroadCastService } from '../../../../service/sys/comp-broadcast-service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';


// Dto
import { PersonRelationListDto } from '../../../../dto/person/relation/list.dto';
import { PersonRelationGetListCriteriaDto } from '../../../../dto/person/relation/getlist-criteria.dto';
import { FicheGetListCriteriaDto } from '../../../../dto/fiche/getlist-criteria.dto';
import { PersonRelationFindGetListCriteriaDto } from '../../../../dto/person/relation/find/getlist-criteria.dto';
import { PersonRelationDeleteDto } from '../../../../dto/person/relation/delete.dto';
import { PersonRelationSubListDto } from '../../../../dto/person/relation/sub-list.dto';

// Bo
import { PersonProfileBo } from '../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../enum/sys/comp-broadcast-types.enum';
import { ApprovalStats } from '../../../../enum/approval/stats.enum';
import { FicheTypeFakes } from '../../../../enum/fiche/type-fakes.enum';
import { PersonTypes } from '../../../../enum/person/person-types.enum';
import { DialogIcons } from '../../../../enum/sys/dialog/dialog-icons.enum';
import { DialogButtons } from '../../../../enum/sys/dialog/dialog-buttons.enum';
import { FicheContents } from '../../../../enum/fiche/contents.enum';
import { RelationTypes } from '../../../../enum/person/relation-types.enum';
import { Stc, expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-relation-list-index',
    templateUrl: './index.comp.html',
    animations: [expandCollapse]
})
export class PersonRelationListIndexComp implements OnInit, OnDestroy {
    profile: PersonProfileBo;

    constructor(
        private personRelationService: PersonRelationService,
        private compBroadCastService: CompBroadCastService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private localStorageService: LocalStorageService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.newPersonRelationListDto = new PersonRelationListDto(this.dicService);
        this.relationList = [];
        this.profile = this.localStorageService.personProfile;
    }

    isPersonRelationShow: boolean = false;

    busy: boolean = false;

    @ViewChild(FicheListIndexComp, { static: false }) childActivities: FicheListIndexComp;

    @ViewChild('childAlonePerson', { static: false }) childAlonePerson: PersonAloneCrudComp;
    @ViewChild('childNewAlonePerson', { static: false }) childNewAlonePerson: PersonAloneCrudComp;

    @ViewChild(FicheCrudComp, { static: false }) childFicheCrud: FicheCrudComp;

    @ViewChild(PersonRelationFindListIndexComp, { static: false }) childRelationFind: PersonRelationFindListIndexComp;

    @ViewChild(PageTitleComp, { static: false }) childPageTitle: PageTitleComp;

    criteriaDto: PersonRelationGetListCriteriaDto;
    relationList: PersonRelationListDto[];

    subsNeedRefresh: Subscription;
    subscriptionModalClosed: Subscription;

    ngOnInit(): void {
        this.subsNeedRefresh = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.NeedRefresh).subscribe(
            x => {
                if (x == 'CurrencyChanged') {
                    this.profile = this.localStorageService.personProfile;
                } else if (this.utils.isNotNull(x) && this.utils.isString(x)) {
                    this.profile = this.localStorageService.personProfile;
                    if (x.includes('PersonRelationListCriteria')) {
                        let criteriaDto: PersonRelationGetListCriteriaDto = JSON.parse(x).PersonRelationListCriteria;

                        if (this.utils.isNotNull(this.criteriaDto) && this.criteriaDto.PersonId != criteriaDto.PersonId) {
                            this.isPersonRelationShow = false;
                        }

                        this.criteriaDto = criteriaDto;
                        this.relationList = [];
                        this.loadData();
                    } else if (x.includes('FicheCrudFixed')) {
                        // this codes runs after a fiche is saved to such person.
                        // and now we are updating list item.
                        // Codes belows will return just a row.
                        const personRelationId: number = parseInt(JSON.parse(x).FicheCrudFixed, 10);
                        const criteriaDto = new PersonRelationGetListCriteriaDto();
                        criteriaDto.PersonRelationId = personRelationId;
                        criteriaDto.CurrencyId = this.profile.SelectedCurrencyId;
                        criteriaDto.PersonId = this.profile.PersonId;
                        this.busy = true;
                        let subscribeGetList = this.personRelationService.getList(criteriaDto).subscribe(
                            r => {
                                this.utils.unsubs(subscribeGetList);
                                this.busy = false;

                                if (r.IsSuccess && this.utils.isNotNull(r.Dto) && r.Dto.length == 1) {
                                    this.relationList.forEach(element => {
                                        if (element.Id == personRelationId) {
                                            const newElement = new PersonRelationListDto(this.dicService);
                                            newElement.copy(r.Dto[0]);
                                            newElement.handleCaption(true);

                                            // TODO:
                                            // Angular did not recognize an item is changed in a list.
                                            // Investigate this later.
                                            // So I just assign the 'Balance' value but whole item must be be assigned.
                                            element.Balance = newElement.Balance;
                                            element.BalanceStatId = newElement.BalanceStatId;
                                        }
                                    });
                                } else {
                                    this.dialogService.showError(r.Message);
                                }
                            },
                            err => {
                                this.utils.unsubs(subscribeGetList);
                                this.busy = false;
                            }
                        );
                    }
                }
            }
        );

        this.subscriptionModalClosed = this.compBroadCastService.getMessage<string>(CompBroadCastTypes.ModalClosed).subscribe(
            x => {
                if (x == 'FicheCrudComp') {
                    this.relationList.forEach(element => {
                        element.IsFicheOpen = false;
                        element.IsFicheOperationsOpen = false;
                    });
                } else if (x == 'PersonRelationFindListIndexComp') {
                    this.isPersonRelationShow = false;
                }
            }
        );
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNeedRefresh);
        this.utils.unsubs(this.subscriptionModalClosed);
    }

    loadData(): void {
        if (this.utils.isNull(this.criteriaDto) || this.waitTill) {
            return;
        }

        this.waitTill = true;

        this.busy = true;
        this.criteriaDto.PageOffSet = this.relationList.length;
        let subs = this.personRelationService.getList(this.criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                        let i = 0;

                        if (this.utils.isNotNull(x.Dto) && x.Dto.length > 0) {
                            let found: PersonRelationListDto = null;
                            x.Dto.forEach(element => {
                                found = this.relationList.find(f => f.RelatedPersonId == element.RelatedPersonId);
                                if (this.utils.isNull(found)) {
                                    if (element.RelatedPersonId == this.criteriaDto.PersonId) {

                                    } else {
                                        const newElement = new PersonRelationListDto(this.dicService);
                                        newElement.copy(element);
                                        newElement.handleCaption(true);

                                        this.relationList.push(newElement);
                                    }
                                }
                            });
                        }
                    }
                } else {
                    this.dialogService.showError(x.Message);
                }

                this.waitTill = false;
            },
            err => {
                this.waitTill = false;

                this.logExService.saveObservableEx(err, this.constructor.name, 'loadData', subs);
                this.busy = false;
            }
        );
    }

    waitTill: boolean = false;
    waitRepeat: boolean = false;
    @HostListener('window:scroll', ['$event'])
    onScroll($event: Event): void {
        if ((window.innerHeight + window.scrollY + 1) >= document.scrollingElement.scrollHeight) {

            if (!this.waitRepeat) {
                this.waitRepeat = true;

                setTimeout(() => {
                    this.waitRepeat = false;
                }, Stc.waitRepeatTimeout);

                this.loadData();
            }
        }
    }

    getActivities(listItem: PersonRelationListDto): void {
        const criteriaDto = new FicheGetListCriteriaDto();

        criteriaDto.OtherPersonsIdList = [];
        criteriaDto.OtherPersonsIdList.push(listItem.RelatedPersonId);

        criteriaDto.ApprovalStatIdList = [];
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xAccepted);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPending);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xPulledBack);
        criteriaDto.ApprovalStatIdList.push(ApprovalStats.xRejected);

        criteriaDto.FicheTypeFakeIdList = [];

        for (let enumMember in FicheTypeFakes) {
            let i: number = 0;
            if (!isNaN(parseInt(enumMember, 10))) {
                criteriaDto.FicheTypeFakeIdList.push(parseInt(enumMember, 10));
            }
        }

        listItem.IsActivitiesOpen = !listItem.IsActivitiesOpen;

        if (listItem.IsActivitiesOpen) {
            this.relationList.forEach(element => {
                if (element.RelatedPersonId != listItem.RelatedPersonId)
                    element.IsActivitiesOpen = false;
            });
        } else {
            return;
        }

        setTimeout(() => {
            this.childActivities.showInside(criteriaDto, listItem.RelatedPersonFullName);
        });
    }

    newPersonRelationListDto: PersonRelationListDto;
    getAlonePerson(id: number): void {
        const listItem: PersonRelationListDto = this.relationList.find(f => f.RelatedPersonId == id);

        if (this.utils.isNotNull(listItem) && !listItem.IsAlonePersonOpen) {
            listItem.IsAlonePersonOpen = !listItem.IsAlonePersonOpen;

            if (listItem.IsAlonePersonOpen) {
                this.relationList.forEach(element => {
                    if (element.RelatedPersonId != listItem.RelatedPersonId)
                        element.IsAlonePersonOpen = false;
                });
            } else {
                return;
            }

            setTimeout(() => {
                let subscribeShowInside = this.childAlonePerson.showInside(listItem.RelatedPersonId, this.criteriaDto.PersonId).subscribe(
                    x => {
                        this.utils.unsubs(subscribeShowInside);

                        let ind = this.relationList.findIndex(x => x.RelatedPersonId == id);
                        this.relationList[ind].RelatedPersonFullName = x.PersonTypeId == PersonTypes.xRealPerson ?
                            x.Name + ' ' + x.Surname : x.Name;
                    }
                );
            });
        } else if (this.utils.isNull(listItem) && !this.newPersonRelationListDto.IsAlonePersonOpen) {
            this.newPersonRelationListDto = new PersonRelationListDto(this.dicService);
            this.newPersonRelationListDto.RelatedPersonId = 0;
            this.newPersonRelationListDto.IsAlonePersonOpen = true;

            setTimeout(() => {
                let subscribeShowInside = this.childNewAlonePerson.showInside(0, this.criteriaDto.PersonId).subscribe(
                    x => {
                        this.utils.unsubs(subscribeShowInside);

                        this.loadData();
                    }
                );
            });
        }
    }

    showFindRelation(): void {
        this.isPersonRelationShow = !this.isPersonRelationShow;

        if (!this.isPersonRelationShow) return;

        setTimeout(() => {
            const criteriaDto = new PersonRelationFindGetListCriteriaDto();
            criteriaDto.ParentPersonId = this.criteriaDto.PersonId;

            criteriaDto.RelationTypeId = null;

            this.childRelationFind.showInside(criteriaDto);
        });
    }

    delete(listItem: PersonRelationListDto, listSubItem: PersonRelationSubListDto): void {
        // Only shop owners can delete any relation.
        if (!this.personRelationService.hasRelationIn(RelationTypes.xMyself, RelationTypes.xMyShop)) {
            this.toastr.warning(this.dicService.getValue('xAuthOnlyShopOwners'));
            return;
        }

        this.dialogService.show({
            text: this.dicService.getValue('xConfirmDisconnectConnection'),
            icon: DialogIcons.Question,
            buttons: DialogButtons.YesNo,
            closeIconVisible: true,
            yes: () => {
                const requestDto = new PersonRelationDeleteDto();
                requestDto.PersonId = this.criteriaDto.PersonId;
                requestDto.PersonRelationId = listSubItem.PersonRelationId;

                this.busy = true;
                let subs = this.personRelationService.delete(requestDto).subscribe(
                    x => {
                        this.utils.unsubs(subs);
                this.busy = false;

                        if (x.IsSuccess) {
                            const ind: number = listItem.RelationSubList.findIndex(x => x.PersonRelationId == listSubItem.PersonRelationId);
                            listItem.RelationSubList.splice(ind, 1);
                            listItem.handleCaption(true);

                            this.toastr.success(this.dicService.getValue('xConnectionDeleted'));

                            this.relationList = [];
                            this.loadData();
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

    openFiche(listItem: PersonRelationListDto, ficheTypeFakeId: FicheTypeFakes) {
        let count: number = 0;
        this.relationList.forEach(element => {
            count++;

            element.IsFicheOpen = false;
            element.IsFicheOperationsOpen = false;

            if (count == this.relationList.length) {
                listItem.IsFicheOpen = true;
                listItem.IsFicheOperationsOpen = false;

                if (listItem.IsFicheOpen) {
                    setTimeout(() => {
                        listItem.IsFicheOpen = false;

                        setTimeout(() => {
                            listItem.IsFicheOpen = true;

                            setTimeout(() => {
                                this.childFicheCrud.showAsFixed(listItem, 0, ficheTypeFakeId, FicheContents.xStartingBalance);
                            });
                        });


                    });
                }
            }
        });
    }
}