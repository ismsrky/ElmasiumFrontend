import { Component, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { TabDirective } from 'ngx-bootstrap';
import { ToastrService } from 'ngx-toastr';

// Comp
import { PersonAddressCrudComp } from '../../address/crud/crud.comp';

// Service
import { AlonePersonService } from '../../../../service/person/alone.service';
import { PersonRelationService } from '../../../../service/person/relation.service';
import { DictionaryService } from '../../../../service/dictionary/dictionary.service';
import { DialogService } from '../../../../service/sys/dialog.service';
import { LogExceptionService } from '../../../../service/log/exception.service';
import { UtilService } from '../../../../service/sys/util.service';

// Dto
import { AlonePersonDto } from '../../../../dto/person/alone/alone.dto';
import { AlonePersonGetCriteriaDto } from '../../../../dto/person/alone/get-criteria.dto';
import { PersonRelationListDto } from '../../../../dto/person/relation/list.dto';
import { PersonRelationAvaibleTypeGetListCriteriaDto } from '../../../../dto/person/relation/avaible-getlist-criteria.dto';

// Enum
import { Stats } from '../../../../enum/sys/stats.enum';
import { Currencies } from '../../../../enum/person/currencies.enum';
import { PersonTypes } from '../../../../enum/person/person-types.enum';
import { RelationTypes } from '../../../../enum/person/relation-types.enum';
import { expandCollapseHidden, expandCollapse } from '../../../../stc';

@Component({
    selector: 'person-alone-crud',
    templateUrl: './crud.comp.html',
    animations: [expandCollapseHidden, expandCollapse]
})
export class PersonAloneCrudComp implements OnInit, OnDestroy {
    @Input('personRelationListDto') personRelationListDto: PersonRelationListDto;
    alonePersonDto: AlonePersonDto;

    currencies = Currencies;
    stats = Stats;
    personTypes = PersonTypes;
    relationTypes = RelationTypes;

    avaibleRelationIdList: RelationTypes[];

    @ViewChild('personAloneForm', { static: false }) personAloneForm: NgForm;
    @ViewChild(PersonAddressCrudComp, { static: false }) tabAddress: PersonAddressCrudComp;

    isNew: boolean = false;

    busy: boolean = false;
    private _eventBus: Subject<AlonePersonDto>;

    constructor(
        private alonePersonService: AlonePersonService,
        private dicService: DictionaryService,
        private toastr: ToastrService,
        private personRelationService: PersonRelationService,
        private dialogService: DialogService,
        private logExService: LogExceptionService,
        private utils: UtilService) {
        this.alonePersonDto = new AlonePersonDto();
        this.avaibleRelationIdList = [];
    }

    showInside(personId: number, parentRelationPersonId: number): Observable<AlonePersonDto> {
        //this.personAloneForm.resetForm();
        this._eventBus = new Subject<AlonePersonDto>();

        this.alonePersonDto = new AlonePersonDto();
        this.alonePersonDto.StatId = Stats.xActive;
        this.alonePersonDto.IsCrudOpen = true;

        if (personId > 0) {
            this.isNew = false;
            this.loadData(personId, parentRelationPersonId);
        } else { // new account
            this.isNew = true;
            this.alonePersonDto.ParentRelationPersonId = parentRelationPersonId;
        }

        //this.getAvaiblePersonTypes();

        return this._eventBus.asObservable();
    }

    ngOnInit(): void {
    }
    ngOnDestroy(): void {
    }

    loadData(personId: number, parentRelationPersonId: number): void {
        this.busy = true;

        const criteriaDto = new AlonePersonGetCriteriaDto();
        criteriaDto.PersonId = personId;
        criteriaDto.ParentRelationPersonId = parentRelationPersonId;

        let subs = this.alonePersonService.get(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);
                this.busy = false;

                if (x.IsSuccess) {
                    this.alonePersonDto = x.Dto;
                    this.alonePersonDto.IsCrudOpen = true;

                    this.getAvaiblePersonTypes();

                    this.tabAddress.showModal(this.alonePersonDto.PersonAddressId, null);
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
        if (this.personAloneForm.invalid) {
            return;
        }
        if (this.personAloneForm.dirty == false && this.tabAddress.personAddressForm.dirty == false) {
            this.toastr.warning(this.dicService.getValue('xNoChangesMade'));
            return;
        }

        this.alonePersonDto.AddressCountryId = this.tabAddress.personAddressDto.CountryId;
        this.alonePersonDto.AddressStateId = this.tabAddress.personAddressDto.StateId;
        this.alonePersonDto.AddressCityId = this.tabAddress.personAddressDto.CityId;
        this.alonePersonDto.AddressDistrictId = this.tabAddress.personAddressDto.DistrictId;
        this.alonePersonDto.AddressNotes = this.tabAddress.personAddressDto.Notes;

        let subscribeSave = this.alonePersonService.save(this.alonePersonDto).subscribe(
            x => {
                this.utils.unsubs(subscribeSave);

                if (x.IsSuccess) {
                    this._eventBus.next(this.alonePersonDto);

                    this.toastr.success(this.dicService.getValue('xSavedSuccess'));
                    this.personRelationListDto.IsAlonePersonOpen = false;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.utils.unsubs(subscribeSave);

                this.toastr.error(err);
            }
        );
    }
    cancel(): void {
        this.personRelationListDto.IsAlonePersonOpen = false;
    }

    getAvaiblePersonTypes(): void {
        const criteriaDto = new PersonRelationAvaibleTypeGetListCriteriaDto();
        criteriaDto.PersonId = this.alonePersonDto.ParentRelationPersonId;
        criteriaDto.ChildPersonTypeId = this.alonePersonDto.PersonTypeId;
        criteriaDto.OnlyMasters = true;
        criteriaDto.OnlySearchables = true;

        let subs = this.personRelationService.getAvaibleTypeList(criteriaDto).subscribe(
            x => {
                this.utils.unsubs(subs);

                if (x.IsSuccess) {
                    this.avaibleRelationIdList = x.Dto;

                    if (this.isNew)
                        this.alonePersonDto.ChildRelationTypeId = null;
                } else {
                    this.dialogService.showError(x.Message);
                }
            },
            err => {
                this.logExService.saveObservableEx(err, this.constructor.name, 'getAvaiblePersonTypes', subs);
            }
        );
    }

    tab_index: number = 0;
    tabChanged(tabInfo: TabDirective): void {
        this.tab_index = Number(tabInfo.id);

        if (this.tab_index == 1 && !this.isNew) {
            setTimeout(() => {
                this.tabAddress.showModal(this.alonePersonDto.PersonAddressId, null);
            });
        }
    }
}