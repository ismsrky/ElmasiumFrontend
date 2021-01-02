import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

// Service
import { PersonRelationService } from '../../../../../../service/person/relation.service';
import { CompBroadCastService } from '../../../../../../service/sys/comp-broadcast-service';
import { LocalStorageService } from '../../../../../../service/sys/local-storage.service';
import { DialogService } from '../../../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../../../service/log/exception.service';
import { UtilService } from '../../../../../../service/sys/util.service';

// Comp

// Dto
import { PersonRelationFindGetListCriteriaDto } from '../../../../../../dto/person/relation/find/getlist-criteria.dto';
import { PersonRelationAvaibleTypeGetListCriteriaDto } from '../../../../../../dto/person/relation/avaible-getlist-criteria.dto';

// Bo
import { PersonProfileBo } from '../../../../../../bo/person/profile.bo';

// Enum
import { CompBroadCastTypes } from '../../../../../../enum/sys/comp-broadcast-types.enum';
import { Currencies } from '../../../../../../enum/person/currencies.enum';
import { Stats } from '../../../../../../enum/sys/stats.enum';
import { PersonTypes } from '../../../../../../enum/person/person-types.enum';
import { RelationTypes } from '../../../../../../enum/person/relation-types.enum';
import { Stc, expandCollapse } from '../../../../../../stc';

@Component({
    selector: 'person-relation-find-list-criteria',
    templateUrl: './criteria.comp.html',
    animations: [expandCollapse]
})
export class PersonRelationFindListCriteriaComp implements OnInit, OnDestroy {
    criteriaDto: PersonRelationFindGetListCriteriaDto;

    currencies = Currencies;
    stats = Stats;

    @ViewChild('criteriaForm', { static: false }) criteriaForm: NgForm;

    @Input('IsInside') IsInside: boolean = false;;

    profile: PersonProfileBo;

    subsNameModelChange: Subscription;
    nameControl = new FormControl();

    busy: boolean = false
    constructor(
        private personRelationService: PersonRelationService,        
        private localStorageService: LocalStorageService,
        private compBroadCastService: CompBroadCastService,
        private toastr: ToastrService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.clear();
    }

    ngOnInit(): void {
        this.subsNameModelChange = this.nameControl.valueChanges
            .pipe(
                debounceTime(Stc.typingEndTime)
            ).subscribe(newValue => {
                this.criteriaDto.Name = newValue;
                this.search();
            });
    }
    ngOnDestroy(): void {
        this.utils.unsubs(this.subsNameModelChange);
    }

    personTypes = PersonTypes;
    relationTypes = RelationTypes;

    avaibleRelationIdList: RelationTypes[];
    myPersonChanged(): void {
        this.criteriaDto.ParentPersonId = this.profile.PersonId;

        // here we get list of possible relations types that given person can have.
        const criteriaDto = new PersonRelationAvaibleTypeGetListCriteriaDto();
        criteriaDto.PersonId = this.criteriaDto.ParentPersonId;
        criteriaDto.ChildPersonTypeId = null;
        criteriaDto.OnlySearchables = true;
        let subs = this.personRelationService.getAvaibleTypeList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.criteriaDto.RelationTypeId = x.Dto[0];

                    this.avaibleRelationIdList = x.Dto;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'myPersonChanged', subs);
            }
        );
    }

    search(): void {
        if (this.utils.isNotNull(this.criteriaDto.Name) && this.criteriaDto.Name.length < 3) {
            this.toastr.warning('Lütfen en az 3 karakter giriniz.');
            return;
        }
        this.compBroadCastService.sendMessage(CompBroadCastTypes.NeedRefresh, JSON.stringify({ 'PersonRelationFindListCriteria': this.criteriaDto }));
    }

    clear(): void {
        this.profile = this.localStorageService.personProfile;

        this.criteriaDto = new PersonRelationFindGetListCriteriaDto();
        this.criteriaDto.ParentPersonId = this.profile.PersonId;

        this.criteriaDto.Name = null;

        this.avaibleRelationIdList = [];

        this.myPersonChanged();

        // I dont want it to search at first page open.
        // We must wait until the user type the name first.
        //this.search();
    }

    showInside(criteriaDto: PersonRelationFindGetListCriteriaDto): void {
        this.criteriaDto = criteriaDto;

        this.myPersonChanged();
    }

    /**
     * loadMyPersons(): void {
        const criteriaDto = new PersonRelationGetListCriteriaDto();
        criteriaDto.PersonId = this.localStorageService.realPerson.Id;
        criteriaDto.RelationTypeIdList = this.utils.getMyPersonRelationList();
        criteriaDto.GetBalanceList = false;

        this.myPersonList = [];
        this.busy = true;
        let subscribeGetList = this.personRelationService.getList(criteriaDto).subscribe(
            x => {
                this.busy = false;
                this.utils.unsubs(subscribeGetList);

                if (x.IsSuccess && x.Dto && x.Dto.length > 0) {
                    let i: number = 0;
                    x.Dto.forEach(element => {
                        i++;

                        if (this.IsInside && this.criteriaDto.ParentPersonId != element.RelatedPersonId) {

                        } else {
                            let newElement = new PersonRelationListDto(this.dicService);
                            newElement.copy(element);
                            newElement.handleRelationTypes();

                            this.myPersonList.push(newElement);
                        }

                        if (i == x.Dto.length && !this.IsInside) {
                            this.clear();
                        }
                    });
                }
            },
            err => {
                this.busy = false;
                this.utils.unsubs(subscribeGetList);
            }
        );
    }
     */

    close(): void {
        this.compBroadCastService.sendMessage(CompBroadCastTypes.ModalClosed, 'PersonRelationFindListIndexComp');
    }
}